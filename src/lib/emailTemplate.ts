export const wrapInHtmlTemplate = (rawMessage: string, quoteNumber: string) => {
  // Convert standard newlines to br
  let body = rawMessage.replace(/\n/g, '<br/>');

  // Find {portaal_link} and replace with a nice button
  // If the link is explicitly typed, we can replace it if it matches http
  // But our default text just puts the raw URL, e.g. "http://..."
  // It's safer to extract any http link and turn it into a button.
  // Wait, the default template in SendEmailModal injects the raw URL.
  // We can just find the URL and replace it.
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  body = body.replace(urlRegex, (url) => {
    return `
      <br/><br/>
      <table border="0" cellpadding="0" cellspacing="0" style="margin: 0; padding: 0;">
        <tr>
          <td align="center" style="border-radius: 4px;" bgcolor="#c1ed00">
            <a href="${url}" target="_blank" style="font-size: 14px; font-family: Helvetica, Arial, sans-serif; color: #000000; text-decoration: none; border-radius: 4px; padding: 12px 24px; border: 1px solid #c1ed00; display: inline-block; font-weight: bold;">
              Bekijk Jouw Portaal
            </a>
          </td>
        </tr>
      </table>
      <br/>
    `;
  });

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
  .header { padding: 32px 40px; text-align: center; border-bottom: 1px solid #f1f5f9; }
  .logo { font-size: 24px; font-weight: 900; color: #111827; letter-spacing: -0.5px; text-decoration: none; }
  .logo span { color: #c1ed00; }
  .content { padding: 40px; color: #334155; font-size: 15px; line-height: 1.6; }
  .footer { background-color: #111827; color: #94a3b8; padding: 32px 40px; text-align: center; font-size: 12px; }
  .footer a { color: #c1ed00; text-decoration: none; }
</style>
</head>
<body>
  <div style="padding: 40px 20px; background-color: #f9fafb;">
    <div class="container">
      <div class="header">
        <a href="https://studio-graaf.be" class="logo">STUDIO<span>GRAAF</span></a>
      </div>
      
      <div class="content">
        ${body}
      </div>
      
      <div class="footer">
        <p style="margin-top: 0; color: #ffffff; font-weight: bold; font-size: 14px;">Studio Graaf</p>
        <p>Dit is een geautomatiseerd bericht voor referentie <strong>${quoteNumber}</strong>.</p>
        <p style="margin-bottom: 0;">
          <a href="https://studio-graaf.be">studio-graaf.be</a> &nbsp;|&nbsp; 
          <a href="mailto:hello@studio-graaf.be">hello@studio-graaf.be</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
};
