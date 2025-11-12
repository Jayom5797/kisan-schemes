# Data Import Guide

## Step 1: Extract Data from DOCX

Run the extraction script to convert the Word document to JSON:

```bash
npm install  # Install mammoth if not already installed
npm run extract-docx
```

This will:
- Read `34schemes.docx` from the root directory
- Extract text and attempt to parse scheme information
- Create `schemes.json` with the extracted data

## Step 2: Review and Edit JSON

After extraction, **review and edit** `schemes.json` to ensure:
- All schemes have proper `schemeName`
- `department` field is filled correctly
- `description`, `eligibility`, `benefits`, and `applicationProcess` are complete
- Optional fields like `website` and `contactInfo` are added if available

## Step 3: Import to Firebase

Once the JSON is ready and Firebase is configured:

```bash
npm run import-data
```

This will import all schemes from `schemes.json` into your Firestore database.

## JSON Structure

Each scheme should follow this structure:

```json
{
  "schemeName": "Name of the Scheme",
  "department": "Ministry/Department Name",
  "description": "Full description of what the scheme is about",
  "eligibility": "Who is eligible for this scheme",
  "benefits": "What benefits are provided",
  "applicationProcess": "Step-by-step process to apply",
  "website": "https://example.com (optional)",
  "contactInfo": "Phone, Email, etc. (optional)"
}
```

## Manual Entry Alternative

If the automatic extraction doesn't work well, you can:
1. Manually create/edit `schemes.json` following the structure above
2. Or use the web interface to add schemes one by one after the app is running

