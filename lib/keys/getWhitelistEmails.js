import { google } from 'googleapis';

export async function getWhitelistEmails() {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON environment variable");
    }

    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    const auth = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = '1TpI4zGLAdCVvHAX6K8Pme-m8F-FczHHPgJDZQ5W4OXQ4';
    const range = 'Whitelist!A2:B';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    const emails = rows.map((row) => row[1]?.toLowerCase()).filter(Boolean);

    return emails;
  } catch (error) {
    console.error('Error in getWhitelistEmails:', error);
    return [];
  }
}
