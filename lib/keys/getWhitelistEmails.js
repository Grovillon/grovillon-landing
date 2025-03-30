import { google } from 'googleapis';
import path from 'path';
import { readFile } from 'fs/promises';

// 👇 Αλλαξε το με το actual spreadsheet ID σου
const SPREADSHEET_ID = 'ΓΡΑΨΕ_ΕΔΩ_ΤΟ_ID_ΤΟΥ_SHEET';

// 👇 Range = η στήλη όπου είναι τα emails
const RANGE = 'A2:A';

export async function getWhitelistEmails() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(
      await readFile(path.join(process.cwd(), 'lib/keys/whitelist-service-account.json'), 'utf-8')
    ),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });

  const rows = res.data.values || [];

  const emails = rows
    .map((row) => row[0])
    .filter((email) => typeof email === 'string' && email.includes('@'));

  return emails;
}
