/**
 * Utility script to import government schemes data into Firebase
 * 
 * Usage:
 * node scripts/import-data.js
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate configuration
const missingVars = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key.replace('process.env.', ''));

if (missingVars.length > 0) {
  console.error('❌ Missing Firebase environment variables:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\nPlease check your .env.local file.');
  process.exit(1);
}

// Initialize Firebase
console.log('🔥 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DATA_FILE = path.join(__dirname, '../data/schemes-refined.json');
const COLLECTION_NAME = 'governmentSchemes';

async function importData() {
  try {
    // Check if data file exists
    if (!fs.existsSync(DATA_FILE)) {
      console.error(`❌ Data file not found: ${DATA_FILE}`);
      console.log('Please run: npm run transform-schemes');
      process.exit(1);
    }

    // Read and parse JSON file
    console.log('📄 Reading schemes.json...');
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
    const schemes = JSON.parse(fileContent);

    if (!Array.isArray(schemes) || schemes.length === 0) {
      console.error('❌ No schemes found in JSON file');
      process.exit(1);
    }

    console.log(`\n📊 Found ${schemes.length} schemes to import...\n`);

    let successCount = 0;
    let failCount = 0;

    // Import each scheme
    for (let i = 0; i < schemes.length; i++) {
      const scheme = schemes[i];
      try {
        // Validate required fields
        if (!scheme.scheme_name || !scheme.full_name || !scheme.description) {
          console.warn(`⚠️  Skipping scheme ${i + 1}: Missing required fields`);
          failCount++;
          continue;
        }

        // Add to Firestore
        const { idx, id, ...schemeData } = scheme;
        await addDoc(collection(db, COLLECTION_NAME), {
          ...schemeData,
          created_at: new Date(),
          updated_at: new Date(),
        });

        successCount++;
        console.log(`✓ [${successCount}/${schemes.length}] ${scheme.scheme_name}`);
      } catch (error) {
        failCount++;
        console.error(`✗ Failed to import: ${scheme.scheme_name || 'Unknown'}`);
        console.error(`  Error: ${error.message}`);
      }
    }

    console.log(`\n✅ Import completed!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);
    console.log(`\n🎉 You can now view your data in Firebase Console or run: npm run dev`);
  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    if (error.code === 'permission-denied') {
      console.error('\n💡 Tip: Make sure Firestore is enabled and security rules allow writes.');
    }
    process.exit(1);
  }
}

// Run import
importData();

