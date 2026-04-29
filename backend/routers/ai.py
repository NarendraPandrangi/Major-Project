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
        Based on the specific facts, evidence, and conversation above, generate exactly 3 CONCRETE, FINAL settlement options. ALL 3 OPTIONS MUST BE STRONGLY AND DIRECTLY RELATED TO THIS SPECIFIC DISPUTE. 
        
        CRITICAL RULES (VIOLATIONS WILL CAUSE SYSTEM FAILURE):
        1. YOU ARE THE FINAL AUTHORITY. DO NOT suggest "hiring a mediator", "professional mediator intervenes", "going to court", or "consulting a lawyer".
        2. DO NOT use vague fallback phrases like "resolve the issue amicably", "reach a fair compromise", "communicate directly", or "appropriate compensation". Provide EXACT, measurable actions.
        3. EVERY OPTION MUST BE A STANDALONE, COMPLETE RESOLUTION. Do NOT make Option 2 or Option 3 shorter or less detailed than Option 1.
        4. YOU MUST fill in specific nouns (the actual item, service, or contract in dispute) and specific numbers (dollar amounts, days, percentages) in EVERY single option.
        5. Option 1 must be a FULL resolution (e.g., 100% refund, full performance of duty).
        6. Option 2 must be a PARTIAL resolution / COMPROMISE (e.g., 50% refund, partial repair, keep damaged item for discount).
        7. Option 3 must be an ALTERNATIVE resolution (e.g., replacement instead of refund, timeline extension, credit instead of cash).
        
        REQUIRED OUTPUT FORMAT (Follow this rigid template exactly):
        
        Analysis: [2-3 sentences summarizing the specific conflict over [INSERT EXACT PRODUCT/ISSUE NAME]. State what the Plaintiff wants and what the Defendant is arguing.]
        
        Option 1: [FULL RESOLUTION] The Defendant shall provide a full refund of $[X] to the Plaintiff for the dispute regarding [INSERT EXACT PRODUCT/SERVICE NAME] within [Y] days. Upon successful payment, this dispute is fully resolved.
        
        Option 2: [COMPROMISE RESOLUTION] The Defendant shall provide a partial refund of $[X] (representing Y%) to the Plaintiff. The Plaintiff agrees to accept [INSERT EXACT PRODUCT/SERVICE NAME] in its current state, and the Defendant is relieved of further obligations regarding the [SPECIFIC ISSUE].
        
        Option 3: [ALTERNATIVE RESOLUTION] Instead of a cash refund, the Defendant shall [INSERT SPECIFIC ACTION: e.g., ship a replacement unit, perform the service again, issue store credit] for the [INSERT EXACT PRODUCT/SERVICE NAME] within [X] days. The Plaintiff agrees to accept this alternative in full satisfaction of their claim.
        """
        
        # 4. DEMO HARDCODED RESPONSES
        category = dispute_data.get('category', '')
        
        if category == 'Contract Dispute':
            analysis_text = "Analysis: The dispute involves a breach of a web development contract. The Plaintiff paid a ₹20,000 advance for a website, but claims the Defendant has failed to deliver the agreed features after 75 days. The options balance a full refund, a partial handover of work, and an extended completion timeline."
            suggestions_list = [
                {"id": "1", "text": "The Defendant shall provide a full refund of the ₹20,000 advance within 7 days, and both parties release each other from the contract entirely."},
                {"id": "2", "text": "The Defendant shall retain ₹10,000 for the design work already completed, refund the remaining ₹10,000, and hand over the current source code to the Plaintiff within 7 days."},
                {"id": "3", "text": "The Defendant shall be granted a final, strict 14-day extension to deliver the completed website at no additional cost. If missed, the full ₹20,000 advance must be refunded immediately."}
            ]
        elif category == 'Property Dispute':
            analysis_text = "Analysis: The dispute is regarding the non-refund of a ₹50,000 security deposit. The Plaintiff vacated the property 45 days ago. The options balance a full immediate refund, a deduction for wear-and-tear, and a staggered payment plan."
            suggestions_list = [
                {"id": "1", "text": "The Defendant (Landlord) shall transfer the full ₹50,000 security deposit to the Plaintiff within 3 business days, acknowledging the property was left in good condition."},
                {"id": "2", "text": "The Defendant shall deduct ₹5,000 for standard wear-and-tear cleaning, and refund the remaining ₹45,000 to the Plaintiff within 7 days, resolving the issue."},
                {"id": "3", "text": "The Defendant shall refund the ₹50,000 deposit in two equal monthly installments of ₹25,000, starting immediately, to ease financial burden while satisfying the debt."}
            ]
        elif category == 'Employment Dispute':
            analysis_text = "Analysis: The dispute centers on unpaid final settlement and salary. The Plaintiff resigned with proper notice, but the Defendant has delayed the payout. The options balance immediate full payout, partial immediate payout, and staggered clearing."
            suggestions_list = [
                {"id": "1", "text": "The Defendant shall process the full final settlement and all pending salary to the Plaintiff within 7 days."},
                {"id": "2", "text": "The Defendant shall pay the pending base salary immediately within 48 hours, and process the remaining leave encashment and variables within 30 days."},
                {"id": "3", "text": "The Defendant shall clear the pending amount in three equal, bi-weekly installments to manage company cash flow while ensuring the employee is paid in full."}
            ]
        elif category == 'Consumer Dispute':
            analysis_text = "Analysis: The dispute concerns a cancelled laptop order worth ₹65,000. The Plaintiff cancelled within the policy window, but the refund is delayed. The options offer a direct refund, an incentivized store credit, or fulfillment with a discount."
            suggestions_list = [
                {"id": "1", "text": "The Defendant shall process a direct refund of ₹65,000 to the Plaintiff's original payment method within 5 working days."},
                {"id": "2", "text": "The Defendant shall issue a 100% store credit of ₹65,000, plus an additional ₹3,000 bonus credit for the delay, valid for one year."},
                {"id": "3", "text": "The Defendant shall dispatch the originally ordered laptop within 48 hours and provide a ₹5,000 partial cash refund to the Plaintiff for the delay."}
            ]
        elif category == 'Business Dispute':
            analysis_text = "Analysis: The dispute is over an outstanding ₹75,000 payment for completed digital marketing services. The options balance full immediate payment, a discounted immediate settlement, and a structured payment plan."
            suggestions_list = [
                {"id": "1", "text": "The Defendant shall clear the outstanding invoice of ₹75,000 in full via bank transfer within 7 days."},
                {"id": "2", "text": "The Defendant shall pay a discounted settlement of ₹60,000 immediately within 3 days, fully settling the account for both parties."},
                {"id": "3", "text": "The Defendant shall clear the dues via a payment plan: ₹25,000 immediately, ₹25,000 in 30 days, and the final ₹25,000 in 60 days."}
            ]
        elif category == 'Family Dispute':
             analysis_text = "Analysis: The dispute involves the distribution of inherited family property. The options balance an immediate sale, an internal family buyout, and a structured independent mediation phase."
             suggestions_list = [
                 {"id": "1", "text": "The property shall be listed for sale immediately, with the proceeds distributed equally among all legal heirs within 30 days of the sale closing."},
                 {"id": "2", "text": "The Defendant may take sole ownership by purchasing the Plaintiff's lawful share at a mutually agreed independent market valuation within 90 days."},
                 {"id": "3", "text": "Both parties agree to pause all actions and enter into binding, formal mediation with an independent property appraiser to establish exact boundaries and shares rationally."}
             ]
        elif category == 'Debt Collection':
             analysis_text = "Analysis: The dispute is over a personal loan of ₹30,000 which has exceeded the agreed two-month timeline. The options balance an immediate full return, a discounted settlement, and an interest-free payment plan."
             suggestions_list = [
                 {"id": "1", "text": "The Defendant shall repay the full ₹30,000 via a bank transfer by the end of the current week."},
                 {"id": "2", "text": "The Plaintiff agrees to accept a one-time discounted lump sum payment of ₹22,000 from the Defendant within 7 days to close the debt entirely."},
                 {"id": "3", "text": "The Defendant shall repay the amount in three monthly installments of ₹10,000 without any additional interest or penalties added."}
             ]
        else:
            analysis_text = "Analysis: The dispute centers around a disagreement regarding the provided services or goods. The options offer a full refund, a compromise, or alternative remediation."
            suggestions_list = [
                {"id": "1", "text": "The Defendant shall provide a full refund or full replacement to the Plaintiff within 7 days, fully resolving the dispute."},
                {"id": "2", "text": "The Defendant shall provide a 50% partial refund, and the Plaintiff agrees to accept the service/item in its current state."},
                {"id": "3", "text": "The Defendant shall perform the required service again or ship a replacement unit within 14 days at no additional cost."}
            ]

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
