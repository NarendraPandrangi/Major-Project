import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.sender_email = os.getenv("SENDER_EMAIL")
        self.sender_password = os.getenv("SENDER_PASSWORD")
        self.app_name = "AI Dispute Resolver"
        
    def send_email(self, to_email: str, subject: str, html_content: str):
        """Send an email using SMTP"""
        if not self.sender_email or not self.sender_password:
            print("ℹ️  Backend SMTP not configured. Email notifications handled by frontend EmailJS (separate services for welcome & dispute emails).")
            return False
            
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.app_name} <{self.sender_email}>"
            message["To"] = to_email
            
            # Add HTML content
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.sender_email, self.sender_password)
                server.send_message(message)
                
            print(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False
    
    def send_dispute_filed_notification(self, to_email: str, dispute_title: str, plaintiff_email: str, dispute_id: str):
        """Send notification when a dispute is filed against someone"""
        subject = f"New Dispute Filed Against You - {dispute_title}"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⚖️ New Dispute Filed</h1>
                </div>
                <div class="content">
                    <h2>Action Required</h2>
                    <p>Hello,</p>
                    <p>A new dispute has been filed against you on <strong>{self.app_name}</strong>.</p>
                    <p><strong>Dispute Title:</strong> {dispute_title}</p>
                    <p><strong>Filed by:</strong> {plaintiff_email}</p>
                    <p>Please log in to your account to review the details and respond to this dispute.</p>
                    <a href="http://localhost:5173/dispute/{dispute_id}" class="button">View Dispute</a>
                </div>
                <div class="footer">
                    <p>This is an automated message from {self.app_name}. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return self.send_email(to_email, subject, html_content)
    
    def send_dispute_accepted_notification(self, to_email: str, dispute_title: str, defendant_email: str, dispute_id: str):
        """Send notification when a dispute is accepted"""
        subject = f"Dispute Accepted - {dispute_title}"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Dispute Accepted</h1>
                </div>
                <div class="content">
                    <h2>Good News!</h2>
                    <p>Hello,</p>
                    <p>Your dispute has been accepted by the defendant.</p>
                    <p><strong>Dispute Title:</strong> {dispute_title}</p>
                    <p><strong>Accepted by:</strong> {defendant_email}</p>
                    <p>You can now proceed with the resolution process and communicate via the live chat.</p>
                    <a href="http://localhost:5173/dispute/{dispute_id}" class="button">View Dispute</a>
                </div>
                <div class="footer">
                    <p>This is an automated message from {self.app_name}. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return self.send_email(to_email, subject, html_content)
    
    def send_dispute_rejected_notification(self, to_email: str, dispute_title: str, defendant_email: str, dispute_id: str):
        """Send notification when a dispute is rejected"""
        subject = f"Dispute Rejected - {dispute_title}"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>❌ Dispute Rejected</h1>
                </div>
                <div class="content">
                    <h2>Update on Your Dispute</h2>
                    <p>Hello,</p>
                    <p>Unfortunately, your dispute has been rejected by the defendant.</p>
                    <p><strong>Dispute Title:</strong> {dispute_title}</p>
                    <p><strong>Rejected by:</strong> {defendant_email}</p>
                    <p>You may want to consider alternative resolution methods or contact support for assistance.</p>
                    <a href="http://localhost:5173/dispute/{dispute_id}" class="button">View Dispute</a>
                </div>
                <div class="footer">
                    <p>This is an automated message from {self.app_name}. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return self.send_email(to_email, subject, html_content)
    
    def send_dispute_filed_confirmation(self, to_email: str, dispute_title: str, defendant_email: str, dispute_id: str):
        """Send confirmation when user files a dispute"""
        subject = f"Dispute Filed Successfully - {dispute_title}"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📝 Dispute Filed Successfully</h1>
                </div>
                <div class="content">
                    <h2>Confirmation</h2>
                    <p>Hello,</p>
                    <p>Your dispute has been successfully filed on <strong>{self.app_name}</strong>.</p>
                    <p><strong>Dispute Title:</strong> {dispute_title}</p>
                    <p><strong>Against:</strong> {defendant_email}</p>
                    <p>We have notified the defendant. You will receive an email notification when they respond.</p>
                    <a href="http://localhost:5173/dispute/{dispute_id}" class="button">View Dispute</a>
                </div>
                <div class="footer">
                    <p>This is an automated message from {self.app_name}. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return self.send_email(to_email, subject, html_content)
    
    def send_registration_welcome(self, to_email: str, username: str):
        """Send welcome email after successful registration"""
        subject = f"Welcome to {self.app_name}!"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }}
                .feature {{ background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to {self.app_name}!</h1>
                </div>
                <div class="content">
                    <h2>Hello {username}!</h2>
                    <p>Thank you for registering with <strong>{self.app_name}</strong>. We're excited to have you on board!</p>
                    
                    <p>Our AI-powered platform helps you resolve disputes efficiently and fairly. Here's what you can do:</p>
                    
                    <div class="feature">
                        <strong>⚖️ File Disputes</strong><br>
                        Submit disputes against other parties with detailed descriptions and evidence.
                    </div>
                    
                    <div class="feature">
                        <strong>🤖 AI-Powered Suggestions</strong><br>
                        Get intelligent resolution suggestions based on similar cases and legal precedents.
                    </div>
                    
                    <div class="feature">
                        <strong>💬 Live Chat</strong><br>
                        Communicate directly with the other party to reach a resolution.
                    </div>
                    
                    <div class="feature">
                        <strong>📊 Dashboard</strong><br>
                        Track all your disputes and their statuses in one place.
                    </div>
                    
                    <p>Ready to get started? Log in to your dashboard and explore the platform!</p>
                    
                    <a href="http://localhost:5173/dashboard" class="button">Go to Dashboard</a>
                </div>
                <div class="footer">
                    <p>This is an automated message from {self.app_name}.</p>
                    <p>If you didn't create this account, please contact our support team immediately.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return self.send_email(to_email, subject, html_content)
    
    def send_resolution_approved_notification(self, plaintiff_email: str, defendant_email: str, dispute_title: str, resolution_text: str, dispute_id: str):
        """Send notification when admin approves a resolution"""
        subject = f"Resolution Approved - {dispute_title}"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }}
                .resolution-box {{ background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Resolution Approved</h1>
                </div>
                <div class="content">
                    <h2>Congratulations!</h2>
                    <p>Hello,</p>
                    <p>The resolution for your dispute has been <strong>approved by our admin team</strong>.</p>
                    <p><strong>Dispute Title:</strong> {dispute_title}</p>
                    <div class="resolution-box">
                        <strong>Agreed Resolution:</strong><br>
                        {resolution_text}
                    </div>
                    <p>This case is now officially resolved. You can view and download the settlement agreement from your dashboard.</p>
                    <a href="http://localhost:5173/dispute/{dispute_id}" class="button">View Settlement Agreement</a>
                </div>
                <div class="footer">
                    <p>This is an automated message from {self.app_name}. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        # Send to both parties
        self.send_email(plaintiff_email, subject, html_content)
        self.send_email(defendant_email, subject, html_content)
        return True
    
    def send_resolution_rejected_notification(self, plaintiff_email: str, defendant_email: str, dispute_title: str, rejection_reason: str, dispute_id: str):
        """Send notification when admin rejects a resolution"""
        subject = f"Resolution Requires Revision - {dispute_title}"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }}
                .reason-box {{ background: #fef3c7; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⚠️ Resolution Requires Revision</h1>
                </div>
                <div class="content">
                    <h2>Action Required</h2>
                    <p>Hello,</p>
                    <p>The proposed resolution for your dispute requires revision.</p>
                    <p><strong>Dispute Title:</strong> {dispute_title}</p>
                    <div class="reason-box">
                        <strong>Admin Feedback:</strong><br>
                        {rejection_reason}
                    </div>
                    <p>Please continue negotiations and propose a new resolution that addresses the concerns mentioned above.</p>
                    <a href="http://localhost:5173/dispute/{dispute_id}" class="button">Continue Negotiation</a>
                </div>
                <div class="footer">
                    <p>This is an automated message from {self.app_name}. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        # Send to both parties
        self.send_email(plaintiff_email, subject, html_content)
        self.send_email(defendant_email, subject, html_content)
        return True

    def send_plaintiff_selected_option_notification(self, to_email: str, dispute_title: str, plaintiff_email: str, selected_option: str, dispute_id: str):
        """Send notification when plaintiff selects an AI resolution option"""
        subject = f"Plaintiff Proposed a Resolution - {dispute_title}"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }}
                .option-box {{ background: white; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⚖️ Resolution Proposed</h1>
                </div>
                <div class="content">
                    <h2>Plaintiff Has Selected an Option</h2>
                    <p>Hello,</p>
                    <p>The plaintiff ({plaintiff_email}) has selected a resolution option for the dispute <strong>{dispute_title}</strong>.</p>
                    <div class="option-box">
                        <strong>Proposed Resolution:</strong><br>
                        {selected_option}
                    </div>
                    <p>Please review this proposal. If you agree, you can accept it to resolve the dispute.</p>
                    <a href="http://localhost:5173/dispute/{dispute_id}" class="button">View & Respond</a>
                </div>
                <div class="footer">
                    <p>This is an automated message from {self.app_name}. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return self.send_email(to_email, subject, html_content)

    def send_dispute_dropped_notification(self, to_email: str, dispute_title: str, dropped_by: str, dispute_id: str):
        """Send notification when a dispute is dropped"""
        subject = f"Dispute Dropped - {dispute_title}"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #6b7280, #374151); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; padding: 12px 24px; background: #6b7280; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🛑 Dispute Dropped</h1>
                </div>
                <div class="content">
                    <h2>Dispute Withdrawn/Dropped</h2>
                    <p>Hello,</p>
                    <p>The dispute <strong>{dispute_title}</strong> has been dropped by {dropped_by}.</p>
                    <p>No further action is required from your side regarding this dispute.</p>
                    <a href="http://localhost:5173/dispute/{dispute_id}" class="button">View Dispute Status</a>
                </div>
                <div class="footer">
                    <p>This is an automated message from {self.app_name}. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return self.send_email(to_email, subject, html_content)

# Singleton instance
email_service = EmailService()

