# Fix Firestore Permission Denied Error

## Quick Fix: Update Firestore Security Rules

The import failed because Firestore security rules are blocking writes. Here's how to fix it:

### Step 1: Go to Firestore Rules

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **"Build"** → **"Firestore Database"**
4. Click on the **"Rules"** tab

### Step 2: Update Rules for Development

Replace the existing rules with these (for development/testing):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /governmentSchemes/{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Step 3: Publish Rules

1. Click **"Publish"** button
2. Wait for confirmation that rules are published

### Step 4: Run Import Again

After updating the rules, run:

```bash
npm run import-data
```

## Important Security Note

⚠️ **The rules above allow anyone to read and write to your database!**

This is fine for development, but **before deploying to production**, you should:

1. **Add authentication** to your app, OR
2. **Restrict writes** to authenticated users only, OR  
3. **Use Firebase Admin SDK** for server-side writes only

### Production-Ready Rules Example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /governmentSchemes/{document=**} {
      // Allow anyone to read
      allow read: if true;
      
      // Only allow writes from authenticated users
      allow write: if request.auth != null;
      
      // OR only allow writes from server (using Admin SDK)
      // allow write: if false; // Server-side only
    }
  }
}
```

## After Fixing Rules

Once you've updated the rules and published them, run the import again:

```bash
npm run import-data
```

You should see all 34 schemes imported successfully! ✅

