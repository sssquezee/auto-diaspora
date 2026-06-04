/**
 * Transactional email via Resend.
 *
 * No-op when RESEND_API_KEY is unset — lets local dev and broken-key
 * deploys keep running without exceptions. Caller code never needs to
 * branch on configuration: `await sendEmail(...)` just resolves.
 *
 * Templates inline as small functions returning {subject, html, text}.
 * HTML is minimal — brutalist editorial in plain CSS so Gmail/Outlook
 * render it cleanly. Plain-text fallback is the same content, no styling.
 */

const RESEND_API = "https://api.resend.com/emails";

function isConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;
}

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(args: SendArgs): Promise<void> {
  if (!isConfigured()) return;
  if (!args.to || !args.to.includes("@")) return;

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: args.to,
        subject: args.subject,
        html: args.html,
        text: args.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(
        `[email] Resend ${res.status}: ${body.slice(0, 200)} (to=${args.to})`
      );
    }
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}

// ─── Templates ───────────────────────────────────────────────────────────────

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://autodiaspora.com").replace(/\/$/, "");
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Auto Diaspora";

function wrap(title: string, bodyHtml: string, cta?: { url: string; label: string }): string {
  const buttonHtml = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
         <tr><td style="background:#0a0a0a;border:1.5px solid #0a0a0a;">
           <a href="${cta.url}" style="display:inline-block;padding:14px 24px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:13px;font-weight:800;color:#ffffff;text-decoration:none;letter-spacing:0.12em;text-transform:uppercase;">${cta.label}</a>
         </td></tr></table>`
    : "";
  return `<!doctype html>
<html lang="uk"><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;color:#0a0a0a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f5;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1.5px solid #0a0a0a;">
        <tr><td style="padding:24px 24px 12px 24px;border-bottom:1px solid #e2e2e2;">
          <div style="font-family:'Courier New',monospace;font-size:11px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:#0052ff;">${SITE_NAME}</div>
        </td></tr>
        <tr><td style="padding:24px;">
          ${bodyHtml}
          ${buttonHtml}
        </td></tr>
        <tr><td style="padding:18px 24px;border-top:1px solid #e2e2e2;font-family:'Courier New',monospace;font-size:11px;color:#888888;">
          <a href="${SITE_URL}" style="color:#888888;text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendNewMessageEmail(args: {
  to: string;
  fromName: string;
  preview: string;
  chatUrl: string;
  listingTitle: string;
}): Promise<void> {
  const subject = `${args.fromName}: ${args.listingTitle}`;
  const previewClean = args.preview.replace(/[<>]/g, "").slice(0, 240);
  const html = wrap(
    "Нове повідомлення",
    `<h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.2;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;">Нове повідомлення</h1>
     <p style="margin:0 0 8px 0;font-size:14px;color:#555555;">${args.fromName} написав про <strong style="color:#0a0a0a;">${args.listingTitle}</strong>:</p>
     <blockquote style="margin:12px 0;padding:12px 16px;border-left:3px solid #0052ff;background:#ededed;font-size:14px;line-height:1.55;color:#0a0a0a;">${previewClean}</blockquote>`,
    { url: args.chatUrl, label: "Відкрити чат" }
  );
  const text = `${args.fromName} написав про ${args.listingTitle}:\n\n${previewClean}\n\nВідкрити чат: ${args.chatUrl}\n\n${SITE_URL}`;
  await sendEmail({ to: args.to, subject, html, text });
}

export async function sendListingApprovedEmail(args: {
  to: string;
  listingTitle: string;
  listingUrl: string;
}): Promise<void> {
  const subject = `Оголошення опубліковано: ${args.listingTitle}`;
  const html = wrap(
    "Оголошення опубліковано",
    `<h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.2;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;">Опубліковано ✓</h1>
     <p style="margin:0 0 8px 0;font-size:14px;line-height:1.55;color:#0a0a0a;">Твоє оголошення <strong>${args.listingTitle}</strong> пройшло модерацію і доступне в каталозі.</p>
     <p style="margin:0;font-size:14px;line-height:1.55;color:#555555;">Покупці можуть з тобою звʼязатися через чат у кабінеті.</p>`,
    { url: args.listingUrl, label: "Переглянути" }
  );
  const text = `Твоє оголошення «${args.listingTitle}» пройшло модерацію і доступне в каталозі.\n\n${args.listingUrl}\n\n${SITE_URL}`;
  await sendEmail({ to: args.to, subject, html, text });
}

export async function sendListingRejectedEmail(args: {
  to: string;
  listingTitle: string;
  reason?: string | null;
}): Promise<void> {
  const subject = `Оголошення відхилено: ${args.listingTitle}`;
  const reasonBlock = args.reason
    ? `<p style="margin:0 0 8px 0;font-size:14px;color:#555555;">Причина:</p>
       <blockquote style="margin:12px 0;padding:12px 16px;border-left:3px solid #cf222e;background:#ededed;font-size:14px;line-height:1.55;color:#0a0a0a;">${args.reason.replace(/[<>]/g, "")}</blockquote>`
    : "";
  const html = wrap(
    "Оголошення відхилено",
    `<h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.2;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;">Відхилено</h1>
     <p style="margin:0 0 8px 0;font-size:14px;line-height:1.55;color:#0a0a0a;">Твоє оголошення <strong>${args.listingTitle}</strong> не пройшло модерацію.</p>
     ${reasonBlock}
     <p style="margin:12px 0 0 0;font-size:13px;line-height:1.55;color:#555555;">Підправ опис/фото згідно з правилами і подай заново.</p>`,
    { url: `${SITE_URL}/new`, label: "Подати знов" }
  );
  const text = `Твоє оголошення «${args.listingTitle}» не пройшло модерацію.${args.reason ? `\n\nПричина: ${args.reason}` : ""}\n\nПодай заново: ${SITE_URL}/new\n\n${SITE_URL}`;
  await sendEmail({ to: args.to, subject, html, text });
}
