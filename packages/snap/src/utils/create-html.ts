import { dedent } from './dedent';

export const createHtml = (componentString: string, cssLinks: string[], title?: string) => {
  return dedent(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${title}</title>
    ${cssLinks.join('\n')}
  </head>
  <body>
    ${componentString}
  </body>
  </html>`);
};
