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
			subject: "Your CUSEC 2026 Photobooth Memories!",
			html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <p style="margin: 0 0 16px 0; font-size: 16px;">Here's your photo strip!</p>
            
            <p style="margin: 0 0 16px 0; font-size: 16px;">Post it on socials with <strong>#CUSEC2026</strong></p>

            <p style="margin: 0 0 24px 0; font-size: 16px;">Thanks for stopping by!</p>

            <p style="font-size: 14px; color: #6b7280;">
              <a href="https://instagram.com/cusecofficial" style="color: #0369a1;">Instagram</a> · 
              <a href="https://linkedin.com/company/cusec" style="color: #0369a1;">LinkedIn</a> · 
              <a href="https://2026.cusec.net" style="color: #0369a1;">cusec.net</a>
            </p>
          </body>
        </html>
      `,
			attachments: [
				{
					filename: "photostrip.png",
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
