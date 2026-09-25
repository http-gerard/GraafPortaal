const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `const baseUrl = process.env.RENDER_EXTERNAL_URL || process.env.APP_URL || 'http://localhost:3000';
  const redirectUri = \`\${baseUrl}/api/teamleader/callback\`;`;

code = code.replace(
  'const redirectUri = "http://localhost:3000/api/teamleader/callback";',
  replacement
);

code = code.replace(
  'const redirectUri = "http://localhost:3000/api/teamleader/callback";',
  replacement
);

fs.writeFileSync('server.ts', code);
