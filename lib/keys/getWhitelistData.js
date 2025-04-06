import { google } from 'googleapis';

export async function getWhitelistData() {
  try {
    const serviceAccount = JSON.parse(
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON.trim()
    );

    const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
    const auth = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      scopes
    );

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = '1TpI4zGLAdCVvHAX6K8Pme-m8F-FczHHPgJDZQ5W4OXQ4';
    const range = 'Whitelist!A2:C';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];

    const whitelist = rows
      .filter((row) => row[1] && row[2])
      .map((row) => ({
        email: row[1].toLowerCase(),
        password: row[2],
      }));

    console.log('✅ whitelist loaded:', whitelist); // DEBUG LINE

    return whitelist;
  } catch (error) {
    console.error('❌ Error in getWhitelistData:', error);
    return [];
  }
}
