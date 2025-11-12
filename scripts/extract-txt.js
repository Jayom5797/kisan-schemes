/**
 * Script to extract data from 34schemes.txt and convert to JSON
 * 
 * Usage:
 * node scripts/extract-txt.js
 * 
 * This will create data/schemes.json with properly parsed scheme data
 */

const fs = require('fs');
const path = require('path');

const TXT_FILE = path.join(__dirname, '../34schemes.txt');
const OUTPUT_FILE = path.join(__dirname, '../data/schemes.json');

function extractData() {
  try {
    console.log('📄 Reading text file...');
    
    if (!fs.existsSync(TXT_FILE)) {
      console.error(`❌ File not found: ${TXT_FILE}`);
      process.exit(1);
    }
    
    const content = fs.readFileSync(TXT_FILE, 'utf-8');
    console.log('✓ File read successfully (length:', content.length, 'characters)');
    
    // Split by date pattern to identify each scheme
    // Pattern: [DD-MM-YYYY HH:MM AM/PM]
    const schemePattern = /\[(\d{2}-\d{2}-\d{4} \d{2}:\d{2} [AP]M)\]/g;
    const schemes = [];
    
    // Find all scheme start positions
    const schemeStarts = [];
    let match;
    while ((match = schemePattern.exec(content)) !== null) {
      schemeStarts.push({
        index: match.index,
        date: match[1],
        fullMatch: match[0]
      });
    }
    
    console.log(`\n📊 Found ${schemeStarts.length} schemes`);
    
    // Extract each scheme
    for (let i = 0; i < schemeStarts.length; i++) {
      const start = schemeStarts[i].index;
      const end = i < schemeStarts.length - 1 ? schemeStarts[i + 1].index : content.length;
      const schemeText = content.substring(start, end);
      
      const scheme = parseScheme(schemeText, i + 1);
      if (scheme && scheme.schemeName) {
        schemes.push(scheme);
        console.log(`✓ Parsed: ${scheme.schemeName}`);
      }
    }
    
    console.log(`\n✅ Successfully parsed ${schemes.length} schemes`);
    
    // Save to JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(schemes, null, 2), 'utf-8');
    console.log(`\n💾 Saved to ${OUTPUT_FILE}`);
    console.log('\n📝 Next steps:');
    console.log('1. Review data/schemes.json to ensure all fields are correct');
    console.log('2. Set up Firebase and configure .env.local');
    console.log('3. Run: npm run import-data');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

function parseScheme(text, schemeNumber) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  if (lines.length === 0) return null;
  
  // Extract scheme name from first line (after date pattern)
  const firstLine = lines[0];
  const schemeNameMatch = firstLine.match(/\]\s*(.+)/);
  const schemeName = schemeNameMatch ? schemeNameMatch[1].trim() : firstLine.replace(/\[.*?\]\s*/, '').trim();
  
  const scheme = {
    schemeName: schemeName,
    department: '',
    description: '',
    eligibility: '',
    benefits: '',
    applicationProcess: '',
    website: '',
    contactInfo: ''
  };
  
  // Parse sections
  let currentSection = '';
  let sectionContent = [];
  let inSection = false;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect section headers (numbered sections)
    const sectionMatch = line.match(/^(\d+)\.\s*(.+)/);
    if (sectionMatch) {
      // Save previous section
      if (inSection && sectionContent.length > 0) {
        saveSection(scheme, currentSection, sectionContent.join(' '));
      }
      
      // Start new section
      const sectionNum = parseInt(sectionMatch[1]);
      const sectionTitle = sectionMatch[2].toLowerCase();
      currentSection = identifySection(sectionNum, sectionTitle);
      sectionContent = [];
      inSection = true;
      continue;
    }
    
    // Skip separator lines
    if (line === '---' || line.match(/^[-=]+$/)) {
      if (inSection && sectionContent.length > 0) {
        saveSection(scheme, currentSection, sectionContent.join(' '));
        sectionContent = [];
      }
      continue;
    }
    
    // Collect content for current section
    if (inSection) {
      sectionContent.push(line);
    } else {
      // Content before first section (usually description)
      if (!scheme.description) {
        scheme.description = line;
      } else {
        scheme.description += ' ' + line;
      }
    }
  }
  
  // Save last section
  if (inSection && sectionContent.length > 0) {
    saveSection(scheme, currentSection, sectionContent.join(' '));
  }
  
  // Extract department from description if not found
  if (!scheme.department && scheme.description) {
    const deptMatch = scheme.description.match(/(?:Department|Ministry|Government) of ([^,\.]+)/i);
    if (deptMatch) {
      scheme.department = deptMatch[1].trim();
    }
  }
  
  // Clean up fields
  Object.keys(scheme).forEach(key => {
    if (typeof scheme[key] === 'string') {
      scheme[key] = scheme[key].trim().replace(/\s+/g, ' ');
    }
  });
  
  return scheme;
}

function identifySection(sectionNum, title) {
  // Map section numbers and titles to our fields
  const titleLower = title.toLowerCase();
  
  // Section 1 is usually Introduction/Description
  if (sectionNum === 1 || titleLower.includes('introduction') || titleLower.includes('overview')) {
    return 'description';
  }
  
  // Section 5 is usually Eligibility
  if (sectionNum === 5 || titleLower.includes('eligibility') || titleLower.includes('criteria')) {
    return 'eligibility';
  }
  
  // Section 6 is usually Implementation Process
  if (sectionNum === 6 || titleLower.includes('implementation') || titleLower.includes('process') || titleLower.includes('how to apply')) {
    return 'applicationProcess';
  }
  
  // Section 7 is usually Benefits
  if (sectionNum === 7 || titleLower.includes('benefit') || titleLower.includes('impact')) {
    return 'benefits';
  }
  
  // Section 2-4 might have department info
  if (sectionNum <= 4 && (titleLower.includes('department') || titleLower.includes('ministry'))) {
    return 'department';
  }
  
  // Default: add to description
  return 'description';
}

function saveSection(scheme, sectionType, content) {
  if (!content || content.length < 10) return;
  
  switch (sectionType) {
    case 'description':
      if (scheme.description) {
        scheme.description += ' ' + content;
      } else {
        scheme.description = content;
      }
      break;
    case 'eligibility':
      if (scheme.eligibility) {
        scheme.eligibility += ' ' + content;
      } else {
        scheme.eligibility = content;
      }
      break;
    case 'applicationProcess':
      if (scheme.applicationProcess) {
        scheme.applicationProcess += ' ' + content;
      } else {
        scheme.applicationProcess = content;
      }
      break;
    case 'benefits':
      if (scheme.benefits) {
        scheme.benefits += ' ' + content;
      } else {
        scheme.benefits = content;
      }
      break;
    case 'department':
      if (!scheme.department) {
        scheme.department = content.substring(0, 200);
      }
      break;
  }
}

// Run extraction
extractData();

