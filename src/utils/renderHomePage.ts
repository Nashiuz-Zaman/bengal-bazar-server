// utils/renderHtmlPage.ts
export const renderHomePage = (content: string, title = "App") => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <style>
          body {
            margin: 0;
            height: 100vh;
            width: 100vw;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #000;
            color: #fff;
            font-family: Arial, sans-serif;
            font-size: clamp(1.5rem, 4vw, 3rem);
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
};
