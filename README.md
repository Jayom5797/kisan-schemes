# Kisan Schemes Database

A modern web application for managing government schemes data with Firebase integration, built with Next.js and ready for Vercel deployment.

## Features

- 📊 Interactive table displaying all government schemes (35+ schemes)
- ➕ Add new schemes with a comprehensive form
- ✏️ Edit existing schemes
- 🗑️ Delete schemes
- 👁️ View detailed scheme information
- 🔥 Firebase Firestore integration for data persistence
- 📱 Responsive design with modern UI
- 🚀 Ready for Vercel deployment
- 🔌 REST API endpoint for other projects

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Firebase Firestore** - Database
- **Lucide React** - Icons

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database in your Firebase project
3. Create a `.env.local` file in the root directory with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Firestore Database Setup

1. Go to Firestore Database in Firebase Console
2. Click "Create database"
3. Start in test mode (for development)
4. Update Firestore security rules to allow reads/writes:

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

**Note:** The collection `governmentSchemes` will be created automatically when you add your first scheme through the web interface.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Add Schemes

Use the "Add Scheme" button in the web interface to add government schemes directly. All data will be stored in Firebase Firestore.

## Data Structure

Each scheme follows this structure:

```typescript
{
  idx: number;
  id: string;
  scheme_code: string;
  scheme_name: string;
  full_name: string;
  description: string;
  category: string;
  eligibility: string[];
  required_documents: string[];
  benefits: string;
  application_process: string;
  official_website?: string;
  deadline?: string;
  is_active: boolean;
  contact_number?: string;
  created_at: Date;
  updated_at: Date;
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Usage

Once deployed, access the data via REST API:

**GET** `/api/schemes`
- Returns all government schemes as JSON
- Example: `https://your-app.vercel.app/api/schemes`

## Deployment to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your Firebase environment variables in Vercel's project settings
4. Deploy!

## Project Structure

```
├── app/
│   ├── api/
│   │   └── schemes/
│   │       └── route.ts      # API endpoint
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/
│   ├── SchemeTable.tsx      # Table component
│   └── SchemeForm.tsx       # Add/Edit form
├── firebase/
│   ├── config.ts            # Firebase config
│   └── schemes.ts           # Firestore operations
├── data/
│   └── schemes-refined.json # Sample scheme data (reference)
└── package.json
```

## License

MIT
