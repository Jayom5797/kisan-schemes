/**
 * Script to extract data from 34schemes.docx and convert to JSON
 * 
 * Usage:
 * npm run extract-docx
 * 
 * This will create data/schemes.json with the extracted data
 * You may need to manually review and adjust the extracted data
 */

const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const DOCX_FILE = path.join(__dirname, '../34schemes.docx');
const OUTPUT_FILE = path.join(__dirname, '../data/schemes.json');

async function extractData() {
  try {
    console.log('📄 Reading docx file...');
    
    if (!fs.existsSync(DOCX_FILE)) {
      console.error(`❌ File not found: ${DOCX_FILE}`);
      process.exit(1);
    }
    
    // Read the docx file and extract text
    const result = await mammoth.extractRawText({ path: DOCX_FILE });
    const text = result.value;
    
    console.log('✓ Extracted text (length:', text.length, 'characters)');
    console.log('\n--- Preview of extracted text (first 1000 chars) ---');
    console.log(text.substring(0, 1000));
    console.log('---\n');
    
    // Parse the text and extract scheme information
    const schemes = parseSchemes(text);
    
    console.log(`\n📊 Found ${schemes.length} schemes`);
    
    if (schemes.length > 0) {
      console.log('\nFirst scheme preview:');
      console.log(JSON.stringify(schemes[0], null, 2).substring(0, 500));
    }
    
    // Save to JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(schemes, null, 2), 'utf-8');
    console.log(`\n✅ Saved ${schemes.length} schemes to ${OUTPUT_FILE}`);
    console.log('\n📝 Next steps:');
    console.log('1. Review and edit data/schemes.json to ensure all fields are correct');
    console.log('2. Make sure each scheme has: schemeName, department, description, eligibility, benefits, applicationProcess');
    console.log('3. Run: npm run import-data (after setting up Firebase)');
    
  } catch (error) {
    console.error('❌ Error extracting data:', error.message);
    if (error.message.includes('mammoth')) {
      console.log('\n💡 Tip: Run "npm install" to install required dependencies');
    }
    process.exit(1);
  }
}

function parseSchemes(text) {
  const schemes = [];
  
  // Split text into lines
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentScheme = null;
  let currentField = null;
  let schemeCounter = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect scheme start - look for numbered items or scheme names
    if (isSchemeStart(line)) {
      // Save previous scheme
      if (currentScheme && currentScheme.schemeName) {
        schemes.push(currentScheme);
      }
      
      // Start new scheme
      schemeCounter++;
      currentScheme = {
        schemeName: extractSchemeName(line),
        department: '',
        description: '',
        eligibility: '',
        benefits: '',
        applicationProcess: '',
        website: '',
        contactInfo: ''
      };
      currentField = null;
    } else if (currentScheme) {
      // Try to detect field labels
      const fieldInfo = detectField(line);
      if (fieldInfo) {
        currentField = fieldInfo.field;
        if (fieldInfo.value) {
          currentScheme[currentField] = fieldInfo.value;
        }
      } else if (currentField) {
        // Continue adding to current field
        if (currentScheme[currentField]) {
          currentScheme[currentField] += ' ' + line;
        } else {
          currentScheme[currentField] = line;
        }
      } else {
        // Default to description if no field detected and description is empty
        if (!currentScheme.description) {
          currentScheme.description = line;
        } else {
          currentScheme.description += ' ' + line;
        }
      }
    }
  }
  
  // Add last scheme
  if (currentScheme && currentScheme.schemeName) {
    schemes.push(currentScheme);
  }
  
  // If no schemes found, create a template with raw text for manual editing
  if (schemes.length === 0 || schemes.every(s => !s.schemeName || s.schemeName.includes('Scheme Name'))) {
    console.log('\n⚠️  Could not automatically parse schemes from document structure.');
    console.log('Creating a template file. Please manually edit data/schemes.json');
    
    // Try to split by common separators
    const sections = text.split(/\n\s*\n/).filter(s => s.trim().length > 20);
    
    return sections.slice(0, 34).map((section, index) => {
      const lines = section.split('\n').filter(l => l.trim());
      const firstLine = lines[0] || `Scheme ${index + 1}`;
      
      return {
        schemeName: firstLine.substring(0, 100).trim(),
        department: "Please fill in",
        description: section.substring(0, 500).trim(),
        eligibility: "Please fill in",
        benefits: "Please fill in",
        applicationProcess: "Please fill in",
        website: "",
        contactInfo: ""
      };
    });
  }
  
  return schemes;
}

function isSchemeStart(line) {
  // Check if line looks like the start of a new scheme
  // Patterns: numbered list (1., 2., etc.), or scheme name patterns
  const numberPattern = /^\d+[\.\)]\s+/;
  const isNumbered = numberPattern.test(line);
  const isShort = line.length < 150;
  const hasSchemeKeywords = /scheme|program|yojana|initiative|plan|mission/i.test(line);
  
  return (isNumbered && isShort) || (isShort && hasSchemeKeywords && !line.includes(':'));
}

function extractSchemeName(line) {
  // Remove numbering and clean up
  return line.replace(/^\d+[\.\)]\s*/, '').replace(/^[-•]\s*/, '').trim();
}

function detectField(line) {
  const lowerLine = line.toLowerCase();
  
  // Field detection patterns
  const fieldPatterns = [
    { 
      field: 'department', 
      keywords: ['department', 'ministry', 'ministry of', 'under', 'implemented by'],
      patterns: [/department[:\s]+(.+)/i, /ministry[:\s]+(.+)/i]
    },
    { 
      field: 'description', 
      keywords: ['description', 'about', 'overview', 'introduction', 'what is'],
      patterns: [/description[:\s]+(.+)/i, /about[:\s]+(.+)/i]
    },
    { 
      field: 'eligibility', 
      keywords: ['eligibility', 'eligible', 'who can', 'criteria', 'qualification', 'who is eligible'],
      patterns: [/eligibility[:\s]+(.+)/i, /eligible[:\s]+(.+)/i]
    },
    { 
      field: 'benefits', 
      keywords: ['benefit', 'benefits', 'advantage', 'what you get', 'features'],
      patterns: [/benefit[s]?[:\s]+(.+)/i]
    },
    { 
      field: 'applicationProcess', 
      keywords: ['application', 'how to apply', 'process', 'procedure', 'steps', 'apply'],
      patterns: [/application[:\s]+(.+)/i, /how to apply[:\s]+(.+)/i]
    },
    { 
      field: 'website', 
      keywords: ['website', 'url', 'link', 'visit', 'http'],
      patterns: [/website[:\s]+(.+)/i, /(https?:\/\/[^\s]+)/i]
    },
    { 
      field: 'contactInfo', 
      keywords: ['contact', 'phone', 'email', 'helpline', 'toll free', 'call'],
      patterns: [/contact[:\s]+(.+)/i, /phone[:\s]+(.+)/i]
    }
  ];
  
  for (const pattern of fieldPatterns) {
    // Check keywords
    for (const keyword of pattern.keywords) {
      if (lowerLine.includes(keyword)) {
        // Try to extract value using regex patterns
        for (const regexPattern of pattern.patterns) {
          const match = line.match(regexPattern);
          if (match && match[1]) {
            return { field: pattern.field, value: match[1].trim() };
          }
        }
        // If no pattern match, check if there's text after the keyword
        const index = lowerLine.indexOf(keyword);
        const afterKeyword = line.substring(index + keyword.length).trim();
        if (afterKeyword && afterKeyword.length > 3) {
          const value = afterKeyword.replace(/^[:-\s]+/, '');
          if (value) {
            return { field: pattern.field, value: value };
          }
        }
        return { field: pattern.field, value: null };
      }
    }
  }
  
  return null;
}

// Run extraction
extractData().catch(console.error);
