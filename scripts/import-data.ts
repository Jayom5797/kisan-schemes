/**
 * Utility script to import government schemes data
 * 
 * Usage:
 * 1. Extract data from 34schemes.docx into a JSON file
 * 2. Format the JSON file with the following structure:
 *    [
 *      {
 *        "schemeName": "Scheme Name",
 *        "department": "Department Name",
 *        "description": "Description",
 *        "eligibility": "Eligibility criteria",
 *        "benefits": "Benefits",
 *        "applicationProcess": "How to apply",
 *        "website": "https://example.com" (optional),
 *        "contactInfo": "Contact info" (optional)
 *      }
 *    ]
 * 3. Update the DATA_FILE path below
 * 4. Run: npx ts-node scripts/import-data.ts
 */

import { addScheme } from '../firebase/schemes';
import * as fs from 'fs';
import * as path from 'path';

const DATA_FILE = path.join(__dirname, '../data/schemes.json');

interface SchemeData {
  schemeName: string;
  department: string;
  description: string;
  eligibility: string;
  benefits: string;
  applicationProcess: string;
  website?: string;
  contactInfo?: string;
}

async function importData() {
  try {
    // Check if data file exists
    if (!fs.existsSync(DATA_FILE)) {
      console.error(`Data file not found: ${DATA_FILE}`);
      console.log('Please create a JSON file with the scheme data first.');
      process.exit(1);
    }

    // Read and parse JSON file
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
    const schemes: SchemeData[] = JSON.parse(fileContent);

    console.log(`Found ${schemes.length} schemes to import...`);

    // Import each scheme
    for (let i = 0; i < schemes.length; i++) {
      const scheme = schemes[i];
      try {
        await addScheme(scheme);
        console.log(`✓ Imported: ${scheme.schemeName} (${i + 1}/${schemes.length})`);
      } catch (error) {
        console.error(`✗ Failed to import: ${scheme.schemeName}`, error);
      }
    }

    console.log('\nImport completed!');
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}

importData();

