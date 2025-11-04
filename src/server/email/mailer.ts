import nodemailer from "nodemailer"

const host = process.env.EMAIL_SERVER_HOST
const port = Number(process.env.EMAIL_SERVER_PORT || 587)
const user = process.env.EMAIL_SERVER_USER
const pass = process.env.EMAIL_SERVER_PASSWORD
const from = process.env.EMAIL_FROM || "Auth <no-reply@example.com>"

if (!host || !user || !pass) {
  // Soft warn at runtime; the API will handle errors per request
  console.warn("[mailer] Missing EMAIL_SERVER_* env vars; emails may fail to send.")
}

const secure = port === 465

export const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: user && pass ? { user, pass } : undefined,
  tls: {
    // allow self-signed in dev if needed
    rejectUnauthorized: false,
  },
  logger: process.env.NODE_ENV !== "production",
  debug: process.env.NODE_ENV !== "production",
})

export async function sendMail(params: { to: string; subject: string; html: string; text?: string }) {
  const { to, subject, html, text } = params
  return transporter.sendMail({ from, to, subject, html, text })
}

export function wrapHtml(inner: string) {
  return `<!doctype html>
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <style>
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f8fafc;color:#0f172a;padding:24px}
        .container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.08);padding:24px}
        h1{font-size:18px;margin:0 0 12px}
        p{margin:0 0 12px;line-height:1.5}
        ul{margin:0 0 12px 20px}
        a{color:#2563eb}
      </style>
    </head>
    <body>
      <div class="container">${inner}</div>
    </body>
  </html>`
}
