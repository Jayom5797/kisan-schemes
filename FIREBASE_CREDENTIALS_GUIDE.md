# How to Get Firebase Credentials

## Step-by-Step Guide to Get All Firebase Configuration Values

### Step 1: Go to Firebase Console
1. Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Select your project (or create a new one if you haven't)

### Step 2: Access Project Settings
1. Click the **gear icon (⚙️)** next to "Project Overview" in the left sidebar
2. Click **"Project settings"**

### Step 3: Get Your Configuration
You'll see your Firebase configuration in two places:

#### Option A: From "Your apps" section (Easiest)
1. Scroll down to the **"Your apps"** section
2. If you don't have a web app yet:
   - Click **"Add app"** button
   - Select the **web icon (</>)** 
   - Give it a nickname like "Government Schemes App"
   - Click **"Register app"**
3. You'll see a code block that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

#### Option B: From "General" tab
1. In Project settings, go to the **"General"** tab
2. Scroll down to **"Your apps"** section
3. Click on your web app (or create one if needed)
4. You'll see the configuration values

### Step 4: Copy Values to .env.local

Copy each value from the Firebase config to your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### Mapping Guide:

| Firebase Config Key | .env.local Variable | Where to Find |
|---------------------|---------------------|---------------|
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` | In the config object |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | In the config object |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | In the config object |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | In the config object |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | In the config object |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` | In the config object |

### Quick Visual Guide:

1. **API Key** - This is the long string starting with "AIzaSy..." 
   - It's the `apiKey` value in the config
   - Copy the entire string (it's usually 39 characters)

2. **Auth Domain** - Usually looks like: `your-project-id.firebaseapp.com`
   - It's the `authDomain` value

3. **Project ID** - Your project's unique identifier
   - It's the `projectId` value
   - You can also see it in the URL: `console.firebase.google.com/project/YOUR-PROJECT-ID`

4. **Storage Bucket** - Usually looks like: `your-project-id.appspot.com`
   - It's the `storageBucket` value

5. **Messaging Sender ID** - A numeric ID
   - It's the `messagingSenderId` value

6. **App ID** - A long string with colons
   - It's the `appId` value
   - Format: `1:123456789012:web:abcdef1234567890`

### Important Notes:

- ✅ **Don't include quotes** around the values in `.env.local`
- ✅ **No spaces** around the `=` sign
- ✅ The API key is safe to use in client-side code (it's public by design)
- ✅ Make sure `.env.local` is in your `.gitignore` (it should be already)

### Still Can't Find It?

If you're having trouble:
1. Make sure you're in the correct Firebase project
2. Make sure you've created a **web app** (not iOS or Android)
3. Try refreshing the Firebase Console page
4. Check if you have the right permissions on the project

### After Filling .env.local:

1. **Save the file**
2. **Restart your development server** if it's running:
   ```bash
   # Stop the server (Ctrl+C) and restart:
   npm run dev
   ```
3. Test the connection by running:
   ```bash
   npm run import-data
   ```

