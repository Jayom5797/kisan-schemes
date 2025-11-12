# Firebase Setup Guide

## Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one if you haven't)
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. If you don't have a web app, click "Add app" and select the web icon (</>)
7. Register your app (you can name it "Government Schemes App")
8. Copy the Firebase configuration object

## Step 2: Create .env.local File

Create a `.env.local` file in the root directory with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Important:** Replace all the placeholder values with your actual Firebase configuration values.

## Step 3: Set Up Firestore Database

1. In Firebase Console, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development) or "Start in production mode" (for production)
4. Select a location for your database (choose the closest to your users)
5. Click "Enable"

**Note:** The collection `governmentSchemes` will be created automatically when you import data. You don't need to create it manually.

## Step 4: Set Up Firestore Security Rules (Important!)

1. Go to "Firestore Database" → "Rules" tab
2. For development, you can use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /governmentSchemes/{document=**} {
      allow read: if true;
      allow write: if false; // Only allow writes from server-side or authenticated users
    }
  }
}
```

**For production**, you should restrict access properly. The app currently doesn't have authentication, so you may want to:
- Add authentication later, OR
- Use Firebase Admin SDK for writes (server-side only)

## Step 5: Import Data

Once Firebase is configured:

```bash
npm run import-data
```

This will:
- Read `data/schemes.json`
- Import all 34 schemes into Firestore
- Create the `governmentSchemes` collection automatically

## Step 6: Verify Data

1. Go to Firestore Database in Firebase Console
2. You should see the `governmentSchemes` collection
3. Click on it to see all imported schemes

## Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"
- Make sure your `.env.local` file exists and has all required variables
- Restart your development server after creating `.env.local`

### Error: "Permission denied"
- Check your Firestore security rules
- Make sure you've enabled Firestore Database

### Error: "Collection not found"
- The collection will be created automatically when you import data
- Make sure you run `npm run import-data` after setting up Firebase

## Next Steps

After importing data:
1. Run `npm run dev` to start the development server
2. Open http://localhost:3000
3. You should see all 34 schemes in the table!

