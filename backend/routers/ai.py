from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import os
import requests
import auth
from database import get_firestore_db, Collections
from dotenv import load_dotenv
import sys
import json

load_dotenv()

router = APIRouter()

class SuggestionRequest(BaseModel):
    dispute_id: str

@router.post("/suggestions")
async def get_suggestions(
    request: SuggestionRequest, 
    current_user: dict = Depends(auth.get_current_user_firestore)
):
    """Generate fair and unbiased suggestions using Kutrim API based on dispute details and chat history."""
    
    try:
        db = get_firestore_db()
        
        # 1. Fetch Dispute Details
        dispute_ref = db.collection(Collections.DISPUTES).document(request.dispute_id)
        dispute_doc = dispute_ref.get()
        
        if not dispute_doc or not dispute_doc.exists():
            return {"raw_response": "Dispute not found.", "suggestions": []}
            
        dispute_data = dispute_doc.to_dict()
        
        # Check for existing suggestions to ensure consistency between users
        existing_suggestions = dispute_data.get('ai_suggestions')
        existing_analysis = dispute_data.get('ai_analysis')
        
        if existing_suggestions and isinstance(existing_suggestions, list) and len(existing_suggestions) > 0:
            print(f"DEBUG: Returning existing suggestions for dispute {request.dispute_id}", file=sys.stderr)
            return {
                "raw_response": existing_analysis or "Analysis retrieved from database.",
                "suggestions": existing_suggestions
            }
        
        # 2. Fetch Chat History
        messages_ref = db.collection(f"disputes/{request.dispute_id}/messages")
        messages_docs = messages_ref.get()
        
        messages = []
        for doc in messages_docs:
            messages.append(doc.to_dict())
        # Sort messages by time
        messages.sort(key=lambda x: x.get("created_at", ""))
        
        # 3. Construct Prompt for AI
        chat_transcript = "\n".join([f"{m.get('sender_name', 'Unknown')}: {m.get('content')}" for m in messages])
        
        prompt = f"""
        You are an expert legal mediator AI. Your goal is to provide fair, unbiased, and actionable resolution suggestions for the following dispute.
        
        DISPUTE DETAILS:
        Title: {dispute_data.get('title')}
        Category: {dispute_data.get('category')}
        Description: {dispute_data.get('description')}
        Amount Disputed: {dispute_data.get('amount_disputed', 'N/A')}
        
        CHAT HISTORY (Between Plaintiff and Defendant):
        {chat_transcript if chat_transcript else "No chat history yet."}
        
        Based on the above, please provide a response in STRICT JSON format with the following structure:
        {{
            "analysis": "A detailed analysis of the situation.",
            "suggestions": [
                {{ "id": "1", "text": "First specific resolution option" }},
                {{ "id": "2", "text": "Second specific resolution option" }},
                {{ "id": "3", "text": "Third specific resolution option" }}
            ]
        }}
        
        Do not include any markdown formatting like ```json ... ```. Just return the raw JSON string.
        """
        
        # 4. Call Kutrim API
        api_key = os.getenv("KUTRIM_API_KEY")
        print(f"DEBUG: API Key found: {'Yes' if api_key else 'No'}", file=sys.stderr)
        
        if not api_key:
            error_msg = "AI Configuration Error: API Key missing. Please check backend .env file."
            print("Error: KUTRIM_API_KEY not found in environment variables.", file=sys.stderr)
            dispute_ref.update({"ai_analysis": error_msg, "ai_suggestions": []})
            return {
                "raw_response": error_msg,
                "suggestions": []
            }
            
        url = "https://cloud.olakrutrim.com/v1/chat/completions" 
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        
        payload = {
            "model": "Krutrim-spectre-v2",
            "messages": [
                {"role": "system", "content": "You are a helpful legal dispute mediator who outputs only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 1024,
            "temperature": 0.5
        }
        
        print(f"DEBUG: Sending request to Kutrim API... Prompt len: {len(prompt)}", file=sys.stderr)
        response = requests.post(url, json=payload, headers=headers)
        
        print(f"DEBUG: Response Status: {response.status_code}", file=sys.stderr)
        
        if response.status_code != 200:
             error_msg = f"AI Service Provider Error ({response.status_code}): {response.text[:100]}..."
             print(f"Kutrim API Error: {response.status_code} - {response.text}", file=sys.stderr)
             dispute_ref.update({"ai_analysis": error_msg, "ai_suggestions": []})
             return {
                 "raw_response": error_msg,
                 "suggestions": []
             }
             
        ai_response = response.json()
        content = ai_response["choices"][0]["message"]["content"]
        print(f"DEBUG: Raw AI Content: {content[:200]}...", file=sys.stderr)
        
        # Clean potential markdown
        content = content.replace("```json", "").replace("```", "").strip()
        
        import re
        try:
            parsed_content = json.loads(content)
        except json.JSONDecodeError:
            # Fallback: Try to find JSON object within the text
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                try:
                    parsed_content = json.loads(json_match.group())
                    print("DEBUG: JSON extracted from text successfully", file=sys.stderr)
                except json.JSONDecodeError:
                     print(f"Failed to parse extracted JSON: {content}", file=sys.stderr)
                     parsed_content = None
            else:
                print(f"No JSON object found in response: {content}", file=sys.stderr)
                parsed_content = None

        if parsed_content:
            # Handle cases where keys exist but values are None (null in JSON)
            analysis_text = parsed_content.get("analysis") or "No analysis provided."
            suggestions_list = parsed_content.get("suggestions") or []
            print("DEBUG: JSON parsed successfully", file=sys.stderr)
        else:
            # Fallback - treat whole content as analysis
            analysis_text = content
            suggestions_list = []
            analysis_text = content
            suggestions_list = []
        
        # Save analysis to dispute
        update_data = {
            "ai_analysis": analysis_text,
            "ai_suggestions": suggestions_list
        }
        print(f"DEBUG: Updating Firestore with analysis len: {len(analysis_text)}", file=sys.stderr)
        
        try:
            dispute_ref.update(update_data)
            print("DEBUG: Firestore update completed", file=sys.stderr)
        except Exception as db_err:
             print(f"DEBUG: Firestore update FAILED: {db_err}", file=sys.stderr)
        
        return {
            "raw_response": analysis_text, 
            "suggestions": suggestions_list
        }
        
    except Exception as e:
        error_msg = f"Internal System Error during generation: {str(e)}"
        print(f"AI Generation Exception: {str(e)}", file=sys.stderr)
        try:
            # Try to save error to DB if possible
            if 'dispute_ref' in locals():
                dispute_ref.update({"ai_analysis": error_msg, "ai_suggestions": []})
        except:
            pass
            
        return {
            "raw_response": error_msg,
            "suggestions": []
        }
