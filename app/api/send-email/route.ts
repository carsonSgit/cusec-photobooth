import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
	try {
		const { email, photoStrip } = await request.json();

		if (!email || !photoStrip) {
			return NextResponse.json(
				{ error: "Email and photo strip are required" },
				{ status: 400 },
			);
		}

		// Check if Resend API key is configured
		if (!process.env.RESEND_API_KEY) {
			return NextResponse.json(
				{
					error: "Email service is not configured. Please set RESEND_API_KEY.",
				},
				{ status: 503 },
			);
		}

		const resend = new Resend(process.env.RESEND_API_KEY);

		// Convert base64 to buffer
		const base64Data = photoStrip.replace(/^data:image\/\w+;base64,/, "");
		const buffer = Buffer.from(base64Data, "base64");

		const { data, error } = await resend.emails.send({
			from: process.env.FROM_EMAIL!,
			to: email,
			subject: "Your CUSEC 2026 Photobooth Memories! 📸",
			html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 0;
              }
              .header {
                background: linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%);
                padding: 40px 20px;
                text-align: center;
                color: white;
              }
              .header h1 {
                margin: 0;
                font-size: 32px;
              }
              .content {
                padding: 30px 20px;
                background: #f9fafb;
              }
              .photo-container {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
              }
              .event-details {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .event-details h2 {
                color: #0c4a6e;
                margin-top: 0;
              }
              .social-links {
                text-align: center;
                padding: 20px;
              }
              .social-links a {
                display: inline-block;
                margin: 0 10px;
                color: #0369a1;
                text-decoration: none;
              }
              .footer {
                background: #1f2937;
                color: #9ca3af;
                padding: 20px;
                text-align: center;
                font-size: 14px;
              }
              .hashtag {
                font-size: 24px;
                color: #0ea5e9;
                font-weight: bold;
                text-align: center;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>CUSEC 2026 Photobooth</h1>
              <p>Your memories from the Canadian University Software Engineering Conference</p>
            </div>

            <div class="content">
              <p>Hey there! 👋</p>
              <p>Thanks for stopping by the CUSEC 2026 photobooth! We hope you had an amazing time capturing these moments.</p>

              <div class="photo-container">
                <p><strong>Your photo strip is attached to this email!</strong></p>
                <p>Download it and share it on social media with <span class="hashtag">#CUSEC2026</span></p>
              </div>

              <div class="event-details">
                <h2>CUSEC 2026 - 25th Anniversary</h2>
                <p><strong>Dates:</strong> January 8-10, 2026</p>
                <p><strong>Location:</strong> Montreal, Canada</p>
                <p>Celebrating 25 years of bringing together Canadian software engineering students for learning, networking, and inspiration.</p>
              </div>

              <div class="social-links">
                <p><strong>Stay Connected:</strong></p>
                <a href="https://2026.cusec.net">Website</a> |
                <a href="https://instagram.com/cusecofficial">Instagram</a> |
                <a href="https://linkedin.com/company/cusec">LinkedIn</a>
              </div>
            </div>

            <div class="footer">
              <p>CUSEC - Canadian University Software Engineering Conference</p>
              <p>© 2026 CUSEC. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
			attachments: [
				{
					filename: `cusec-2026-photobooth-${Date.now()}.png`,
					content: buffer,
				},
			],
		});

		if (error) {
			console.error("Resend error:", error);
			return NextResponse.json(
				{ error: "Failed to send email" },
				{ status: 500 },
			);
		}

		return NextResponse.json({ success: true, data });
	} catch (error) {
		console.error("Email send error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
