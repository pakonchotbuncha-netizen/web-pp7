const {google} = require('googleapis');
const fs = require('fs');
const path = require('path');
const os = require('os');

const spreadsheetId = '1yP_l-WmsnlkMDCkZB7ulhe6oS_AAex8iE3LYdPdg-uc';
const tokenPath = path.join(os.homedir(), '.config', 'gog', 'oauth-client-default.json');
const creds = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
const auth = new google.auth.OAuth2(creds.client_id, creds.client_secret, creds.redirect_uris?.[0] || 'urn:ietf:wg:oauth:2.0:oob');
auth.setCredentials({ refresh_token: creds.refresh_token });
const sheets = google.sheets({version:'v4', auth});

(async () => {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = meta.data.sheets || [];
  const title = 'Shared Working Memory';
  let target = existing.find(s => s.properties && s.properties.title === title);
  if (!target) {
    const resp = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title } } }]
      }
    });
    target = resp.data.replies[0].addSheet;
  }
  console.log(JSON.stringify(target.properties || target));
})().catch(err => {
  console.error(err.message || String(err));
  process.exit(1);
});
