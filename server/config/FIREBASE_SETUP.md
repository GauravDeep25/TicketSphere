# Firebase Admin SDK Setup

This project uses Firebase Admin SDK for authentication. You have two options to configure it:

## Option 1: Service Account Key File (Recommended for Development)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Rename it to `firebase-service-account.json`
7. Place it in the `server/config/` directory

The server will automatically detect and use this file.

## Option 2: Environment Variables (Recommended for Production)

Add these environment variables to your `.env` file:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

## Development Mode

If neither option is configured, the server will run in development mode:
- Firebase token verification will be skipped
- Tokens will be decoded without verification (INSECURE - development only)
- You'll see: "Firebase Admin not configured - running in development mode"

## Security Notes

- **Never commit** your service account key file to version control
- The `firebase-service-account-template.json` is just a template - replace with your actual credentials
- In production, use environment variables instead of files
- Make sure to add `firebase-service-account.json` to your `.gitignore`

## Troubleshooting

If you see "Firebase Admin not configured - using development mode":
1. Check that your service account file exists at `server/config/firebase-service-account.json`
2. Or verify your environment variables are set correctly
3. Restart the server after making changes
