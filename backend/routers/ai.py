from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import os
import requests
import time
import auth
from database import get_firestore_db, Collections
from dotenv import load_dotenv
import sys
import json

load_dotenv()

router = APIRouter()

class SuggestionRequest(BaseModel):
    dispute_id: str
    force: bool = False

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
        
        if not request.force and existing_suggestions and isinstance(existing_suggestions, list) and len(existing_suggestions) > 0:
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
        
        amount = dispute_data.get('amount_disputed', 'N/A')
        
        # Logic to avoid repeating suggestions if force=True
        avoid_suggestions_text = ""
        try:
            if request.force and existing_suggestions:
                 previous_texts = []
                 if isinstance(existing_suggestions, list):
                     for s in existing_suggestions:
                         if isinstance(s, dict):
                             txt = s.get('text', '')
                             if txt: previous_texts.append(txt)
                         elif isinstance(s, str) and s:
                             previous_texts.append(s)
                 
                 if previous_texts:
                     avoid_suggestions_text = "\nPREVIOUSLY SUGGESTED (DO NOT REPEAT THESE, GENERATE 3 NEW/DIFFERENT OPTIONS):\n" + "\n".join([f"- {t}" for t in previous_texts])
        except Exception as e:
            print(f"Warning: Failed to process existing suggestions: {e}", file=sys.stderr)

        # Build evidence context
        evidence_text = dispute_data.get('evidence_text')
        evidence_section = f"Evidence Summary: {evidence_text}" if evidence_text else "Evidence Summary: No formal evidence submitted — base your analysis on the dispute description and the conversation between the parties."

        # Build chat context (truncate if too long to stay within token limits)
        chat_section = ""
        if chat_transcript and chat_transcript.strip():
            # Limit chat transcript to ~2000 chars to avoid exceeding token limits
            truncated_chat = chat_transcript[:2000]
            if len(chat_transcript) > 2000:
                truncated_chat += "\n... [earlier messages truncated]"
            chat_section = f"""\nCONVERSATION BETWEEN PARTIES (use this to understand each party's position, demands, and concerns):\n{truncated_chat}"""
        else:
            chat_section = "\nCONVERSATION: No messages exchanged yet between the parties."

        prompt = f"""
        You are the Binding Arbitrator for this digital dispute resolution platform.
        Your job is to analyze ALL the information below — especially the conversation between the parties — and produce settlement options that directly address the specific issues in THIS dispute.
        
        DISPUTE INFORMATION:
        Title: {dispute_data.get('title')}
        Category: {dispute_data.get('category', 'General Dispute')}
        Disputed Amount/Value: {amount}
        Plaintiff (filed by): {dispute_data.get('creator_email', 'Unknown')}
        Defendant (against): {dispute_data.get('defendant_email', 'Unknown')}
        
        DISPUTE DESCRIPTION (Plaintiff's account):
        {dispute_data.get('description')}
        
        {evidence_section}
        {chat_section}
        {avoid_suggestions_text}

        YOUR MANDATE:
        Based on the specific facts, evidence, and conversation above, generate exactly 3 CONCRETE, FINAL settlement options. ALL 3 OPTIONS MUST BE STRONGLY AND DIRECTLY RELATED TO THIS SPECIFIC DISPUTE. Do NOT make any option generic or vague.
        
        CRITICAL RULES (VIOLATIONS WILL CAUSE SYSTEM FAILURE):
        1. YOU ARE THE FINAL AUTHORITY. DO NOT suggest "hiring a mediator", "professional mediator intervenes", "going to court", "consulting a lawyer", or "third party arbitration".
        2. NEVER suggest a "process" (like "start mediation"). ONLY suggest "OUTCOMES" (like "Pay $500").
        3. If you suggest a split, specify the exact amounts (e.g. "Split 50/50: Plaintiff gets $X, Defendant keeps $Y").
        4. Options must be actionable SETTLEMENTS (e.g., "Party A pays Party B $X", "Party A completes work by Date Y", "Full refund processed").
        5. Do NOT provide vague advice like "communicate better". Give specific terms.
        6. ALL 3 OPTIONS must mention the EXACT subject of the dispute by name (the specific product, service, contract, amount, or issue from the title/description). An option that could apply to any random dispute is UNACCEPTABLE.
        7. Each option must be a DIFFERENT APPROACH to resolving the SAME specific dispute — for example: full resolution, partial resolution, and an alternative resolution (like replacement instead of refund). Do NOT make Option 2 or Option 3 less specific or less detailed than Option 1.
        8. Every option must include specific numbers (dollar amounts, percentages, deadlines, quantities) drawn from the dispute facts. No option should be shorter than 15 words.
        
        REQUIRED OUTPUT FORMAT (Follow this structure exactly):
        
        Analysis: [2-3 sentences summarizing the specific conflict. Name the product/service/issue. State what each party wants based on the description and conversation.]
        
        Option 1: [FULL resolution — e.g., "Full Refund of $500 for the defective XYZ laptop, returned within 7 days"]
        Option 2: [PARTIAL/COMPROMISE resolution — e.g., "Partial Refund of $250 for the XYZ laptop, buyer keeps the unit and seller covers repair costs"]
        Option 3: [ALTERNATIVE resolution — e.g., "Seller replaces the defective XYZ laptop with a new unit within 10 business days, no cash refund"]
        """
        
        # 4. Call Kutrim API
        api_key = os.getenv("KUTRIM_API_KEY")
        
        # Check API Key
        if not api_key: 
            print("Error: KUTRIM_API_KEY not found in environment variables", file=sys.stderr) 
            return {"raw_response": "Server Configuration Error: API Key Missing", "suggestions": []}

        url = "https://cloud.olakrutrim.com/v1/chat/completions" 
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "AI-Dispute-Resolver/1.0"
        }
        
        payload = {
            "model": "Krutrim-spectre-v2",
            "messages": [
                {"role": "system", "content": (
                    "You are an expert AI dispute resolution arbitrator with deep knowledge of "
                    "consumer rights, contract law, service agreements, and fair settlement practices. "
                    "You carefully analyze the dispute facts, evidence, AND the conversation between "
                    "both parties to understand each party's position, claims, and concerns. "
                    "Your settlement options must directly address the specific issues raised in the "
                    "dispute description and the parties' discussion — never give generic suggestions. "
                    "Each option should reflect a different balance of fairness between the parties. "
                    "You NEVER suggest external mediation, hiring lawyers, or going to court. "
                    "You are the FINAL authority."
                )},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 1024,
            "temperature": 0.4
        }
        
        print(f"DEBUG: Sending request to Kutrim API... Prompt len: {len(prompt)}", file=sys.stderr)
        
        # Retry logic for connection stability
        max_retries = 3
        response = None
        
        for attempt in range(max_retries):
            try:
                response = requests.post(url, json=payload, headers=headers, timeout=15)
                if response.status_code == 200:
                    break
                else:
                    print(f"DEBUG: Attempt {attempt+1} failed with status {response.status_code}", file=sys.stderr)
            except requests.exceptions.RequestException as e:
                print(f"DEBUG: Attempt {attempt+1} failed with error: {e}", file=sys.stderr)
                if attempt == max_retries - 1:
                    error_msg = f"AI Service Unavailable: {str(e)}"
                    try:
                         dispute_ref.update({"ai_analysis": error_msg, "ai_suggestions": []})
                    except: pass
                    return {"raw_response": error_msg, "suggestions": []}
                time.sleep(2) # Wait before retrying
        
        if not response:
             return {"raw_response": "Failed to connect to AI service.", "suggestions": []}

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
        
        # --- ROBUST PARSING LOGIC ---
        import re
        
        # 1. Extract Analysis
        # Try to find "Analysis:" explicitly
        analysis_match = re.search(r"Analysis:?\s*(.*?)(?=(Option|Verdict|1[\.\)])\s*[:\.]?\d)", content, re.DOTALL | re.IGNORECASE)
        
        if analysis_match:
            analysis_text = analysis_match.group(1).strip()
        else:
            # Fallback: Take the first paragraph if it looks like text and not an option
            first_part = content.split("Option")[0].strip()
            if len(first_part) > 10 and "1." not in first_part[:5]:
                analysis_text = first_part
            else:
                analysis_text = "Analysis provided in options below."
        
        suggestions_list = []
        
        # Helper to clean option text
        def clean_opt(text):
            return re.sub(r'^[:\-\.]\s*', '', text).strip()

        # Flexible regex to catch "Option 1", "1.", "Verdict 1", etc.
        # This splits the text by the option headers
        parts = re.split(r'(?:Option|Verdict|Solution)\s*\d+[:\.]?|\n\d+[\.\)]', content, flags=re.IGNORECASE)
        
        # The first part is usually preamble/analysis, subsequent parts are the options
        if len(parts) >= 4:
            # parts[0] is preamble/analysis
            # parts[1] is Option 1
            # parts[2] is Option 2
            # parts[3] is Option 3 (and maybe trailing text)
            
            suggestions_list.append({"id": "1", "text": clean_opt(parts[1])})
            suggestions_list.append({"id": "2", "text": clean_opt(parts[2])})
            
            # Clean part 3 (remove any trailing "Conclusion" etc if present)
            opt3_text = clean_opt(parts[3])
            # Stop at double newline or "Note:"
            opt3_text = re.split(r'\n\n|Note:', opt3_text)[0]
            suggestions_list.append({"id": "3", "text": opt3_text})
            
        else:
             # Fallback: specific search if split failed
            opt1_match = re.search(r"(?:Option|1[\.\)])\s*1[:\.]?\s*(.*?)(?=(?:Option|2[\.\)])\s*2)", content, re.DOTALL | re.IGNORECASE)
            if opt1_match: suggestions_list.append({"id": "1", "text": clean_opt(opt1_match.group(1))})
            
            opt2_match = re.search(r"(?:Option|2[\.\)])\s*2[:\.]?\s*(.*?)(?=(?:Option|3[\.\)])\s*3)", content, re.DOTALL | re.IGNORECASE)
            if opt2_match: suggestions_list.append({"id": "2", "text": clean_opt(opt2_match.group(1))})
            
            opt3_match = re.search(r"(?:Option|3[\.\)])\s*3[:\.]?\s*(.*?)(?=$)", content, re.DOTALL | re.IGNORECASE)
            if opt3_match: suggestions_list.append({"id": "3", "text": clean_opt(opt3_match.group(1))})

        
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
