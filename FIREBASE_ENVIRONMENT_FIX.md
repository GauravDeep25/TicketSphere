# 🔥 Firebase Environment Variables Fix for Render

## 🚨 Issue: "Failed to parse private key: Error: Invalid PEM formatted message"

Your deployment is failing because the Firebase private key environment variable is not properly formatted for Render's environment variable system.

## 🛠️ **IMMEDIATE FIX REQUIRED**

### Step 1: Get Your Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ticketsphere-0101`
3. Navigate to: **Project Settings** → **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file
6. Open the JSON file and copy the values

### Step 2: Format the Private Key for Render

**❌ WRONG Format (causes the error):**
```
FIREBASE_PRIVATE_KEY=
AIzaSyAsWn4rt8lSkpdI6AkzkUvklKuLGm-fXYo
```

**✅ CORRECT Format for Render:**
```
FIREBASE_PRIVATE_KEY="
AIzaSyAsWn4rt8lSkpdI6AkzkUvklKuLGm-fXYo"
```

### Step 3: Update Environment Variables in Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Find your backend service**: `ticketsphere-api`
3. **Click on the service** → **Environment** tab
4. **Update these variables:**

```env
FIREBASE_PROJECT_ID=ticketsphere-0101
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
[PASTE YOUR ACTUAL PRIVATE KEY HERE - MULTILINE IS OK]
-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@ticketsphere-0101.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_ID=[your_private_key_id_from_json_file]
FIREBASE_CLIENT_ID=[your_client_id_from_json_file]
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
```

## 🎯 **Key Points for Render Environment Variables:**

1. **Use quotes**: Wrap the private key in double quotes
2. **Preserve line breaks**: Render accepts multiline values in quotes
3. **No escape characters**: Don't use `\n` - use actual line breaks
4. **Include headers**: Keep `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

## 🚀 **After Updating:**

1. **Save the environment variables** in Render dashboard
2. **Redeploy your service** (Render should auto-redeploy)
3. **Check logs** to verify Firebase initialization succeeds

## ✅ **Expected Success Log:**

After fixing, you should see:
```
✅ Firebase config loaded from environment variables
📧 Service account email: firebase-adminsdk-fbsvc@ticketsphere-0101.iam.gserviceaccount.com
```

Instead of:
```
❌ Firebase Admin initialization error: Failed to parse private key: Error: Invalid PEM formatted message.
```

## 🔍 **Verification Steps:**

1. **Check your service logs** in Render dashboard
2. **Test authentication** by trying to log in to your app
3. **Visit health check**: https://ticketsphere-api.onrender.com/api/health

## 📚 **Additional Resources:**

- [Firebase Admin Setup Guide](server/config/FIREBASE_SETUP.md)
- [Render Environment Variables Docs](https://render.com/docs/environment-variables)

---

**Need Help?** If you're still having issues, double-check that:
- Your Firebase project ID matches exactly
- The private key is copied completely (no missing characters)
- You're using the correct service account email