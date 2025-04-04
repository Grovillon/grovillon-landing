import { google } from 'googleapis';
import { readFile } from 'fs/promises';

const SPREADSHEET_ID = '1Tp4zGLAdCVwHAx6K8Pme-m8f-FczHHPgJDZQ5W40XQ4';

export async function getWhitelistEmails() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(
      await readFile(new URL('whitelist-service-account.json', import.meta.url))
    ),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Φύλλο1!A2:B',
  });

  const rows = res.data.values || [];

  const users = rows
    .map(([name, email]) => ({
      name,
      email: typeof email === 'string' ? email.toLowerCase() : '',
    }))
    .filter((user) => user.email.includes('@'));

  return users;
}
