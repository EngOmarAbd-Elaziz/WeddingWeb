const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_PASSWORD;
const rsvpReceiver = process.env.RSVP_RECEIVER_EMAIL || 'sherouk.ahmed1994@gmail.com';

let transporter = null;

if (emailUser && emailPassword) {
    transporter = nodemailer.createTransport({
        service: 'gmail', // You can change this based on the provider
        auth: {
            user: emailUser,
            pass: emailPassword
        }
    });
} else {
    console.warn("Email credentials missing. Email notifications will not be sent.");
}

// Basic HTML escaping helper
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function sendRSVPEmail(guest) {
    if (!transporter) {
        console.log('Would have sent email:', guest);
        return;
    }

    const safeName = escapeHtml(guest.name);
    const safeEmail = escapeHtml(guest.email);
    const safeAttendance = escapeHtml(guest.attendance);
    const safeCompanions = escapeHtml(guest.companions);
    const safeMessage = escapeHtml(guest.message) || '(No message provided)';
    const submittedAt = new Date().toLocaleString();

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fcfbf8; color: #333333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2d7ba; border-radius: 8px; overflow: hidden; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .header { background: #080b12; color: #d4af37; text-align: center; padding: 30px 20px; }
            .header h1 { font-family: 'Times New Roman', Times, serif; margin: 0; font-size: 28px; letter-spacing: 2px; }
            .header p { margin: 5px 0 0; font-size: 14px; letter-spacing: 1px; color: #f3e5ab; }
            .header-date { margin-top: 15px; font-size: 13px; color: #a9a9a9; text-transform: uppercase; letter-spacing: 1px; }
            .content { padding: 30px; }
            .section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #b8860b; border-bottom: 1px solid #f0efe8; padding-bottom: 8px; margin-bottom: 20px; text-align: center; }
            .info-table { width: 100%; border-collapse: collapse; }
            .info-table td { padding: 12px 0; border-bottom: 1px solid #f9f8f4; }
            .info-label { font-size: 12px; color: #888888; text-transform: uppercase; letter-spacing: 1px; width: 40%; }
            .info-value { font-size: 15px; color: #222222; font-weight: 500; }
            .attendance-status { font-weight: bold; color: ${safeAttendance.toLowerCase().includes('yes') || safeAttendance.toLowerCase().includes('attend') ? '#2e8b57' : '#b22222'}; }
            .message-box { background: #fcfbf8; border-left: 3px solid #d4af37; padding: 15px 20px; margin: 25px 0; font-style: italic; color: #444444; line-height: 1.6; }
            .footer { background: #f9f8f4; padding: 20px; text-align: center; border-top: 1px solid #e2d7ba; }
            .footer p { margin: 0; font-size: 11px; color: #888888; text-transform: uppercase; letter-spacing: 1px; }
            .submitted-at { text-align: center; font-size: 11px; color: #aaaaaa; margin-top: 15px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>AHMED & SHEROUK</h1>
                <p>WEDDING RSVP</p>
                <div class="header-date">Friday, 6 November 2026</div>
            </div>
            
            <div class="content">
                <div class="section-title">New RSVP Received</div>
                
                <table class="info-table">
                    <tr>
                        <td class="info-label">Name</td>
                        <td class="info-value">${safeName}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Email</td>
                        <td class="info-value"><a href="mailto:${safeEmail}" style="color: #b8860b; text-decoration: none;">${safeEmail}</a></td>
                    </tr>
                    <tr>
                        <td class="info-label">Attendance</td>
                        <td class="info-value attendance-status">${safeAttendance}</td>
                    </tr>
                    <tr>
                        <td class="info-label">Companions</td>
                        <td class="info-value">${safeCompanions}</td>
                    </tr>
                </table>

                <div class="section-title" style="margin-top: 30px;">Guest Message</div>
                <div class="message-box">
                    "${safeMessage}"
                </div>

                <div class="submitted-at">
                    Submitted: ${submittedAt}
                </div>
            </div>

            <div class="footer">
                <p>Ahmed & Sherouk Wedding Invitation</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: emailUser,
        to: rsvpReceiver,
        subject: `Wedding RSVP — ${safeName}`,
        html: htmlContent,
        text: `New Wedding RSVP\n\nName: ${safeName}\nEmail: ${safeEmail}\nAttendance: ${safeAttendance}\nNumber of companions: ${safeCompanions}\nCongratulations message: ${safeMessage}\nSubmitted at: ${submittedAt}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`RSVP email sent for ${guest.name}`);
    } catch (error) {
        console.error("Error sending RSVP email:", error);
        throw error;
    }
}

module.exports = {
    sendRSVPEmail
};
