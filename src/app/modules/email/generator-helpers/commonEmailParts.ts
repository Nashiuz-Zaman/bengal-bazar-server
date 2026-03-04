// commonEmailParts.ts
export const emailFontImport = `
<link
  href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
  rel="stylesheet"
/>
`;

export const getEmailHeader = (subtitle: string) => `
  <!-- Header -->
  <tr>
    <td align="center" style="background-color:#ffffff; padding:30px;">
      <h1
        style="margin:0; font-size:28px; font-weight:700; font-family:'Poppins', Arial, sans-serif;
        background: linear-gradient(90deg, #7E22CE, #EC4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;"
      >
        LUMORA
      </h1>
      <p style="margin:10px 0 0 0; font-size:14px; font-weight:400; color:#6b7280;">
        ${subtitle}
      </p>
    </td>
  </tr>
`;

export const getEmailFooter = (year: number) => `
  <!-- Footer -->
  <tr>
    <td align="center" style="padding:20px; background-color:#f3f4f6; font-size:12px; color:#9ca3af;">
      © ${year} Lumora. All rights reserved.
    </td>
  </tr>
`;

export const getEmailWrapperStart = (title: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    ${emailFontImport}
  </head>
  <body
    style="margin:0; padding:0; background-color:#e5e7eb; font-family:'Poppins', Arial, sans-serif;"
  >
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:20px;">
          <table
            role="presentation"
            cellspacing="0"
            cellpadding="0"
            border="0"
            width="100%"
            style="max-width:600px; background-color:#ffffff; border-radius:8px; overflow:hidden;"
          >
`;

export const emailWrapperEnd = `
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
