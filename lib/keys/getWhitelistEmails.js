import { google } from 'googleapis';

export async function getWhitelistEmails() {
  const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

  const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
  const auth = new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    scopes
  );

  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = '1TpI4zGLAdCVvHAX6K8Pme-m8F-FczHHPgJDZQ5W4OXQ4';
  const range = 'Whitelist!A2:B'; // ή όπως το έχεις ορίσει

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = response.data.values || [];
  const emails = rows.map((row) => row[1]?.toLowerCase()).filter(Boolean);

  return emails;
}
