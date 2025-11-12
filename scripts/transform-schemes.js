/**
 * Script to transform existing schemes.json to new refined structure
 * 
 * Usage:
 * node scripts/transform-schemes.js
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const INPUT_FILE = path.join(__dirname, '../data/schemes.json');
const OUTPUT_FILE = path.join(__dirname, '../data/schemes-refined.json');

// Category mapping based on scheme name/keywords
function determineCategory(schemeName, description) {
  const name = schemeName.toLowerCase();
  const desc = description.toLowerCase();
  
  if (name.includes('credit') || name.includes('kcc') || name.includes('loan')) {
    return 'credit';
  }
  if (name.includes('market') || name.includes('e-nam') || name.includes('nam')) {
    return 'market_linkage';
  }
  if (name.includes('income') || name.includes('samman') || name.includes('bandhu') || name.includes('kalia')) {
    return 'income_support';
  }
  if (name.includes('organic') || name.includes('pkv') || name.includes('jeevamrutha')) {
    return 'organic_farming';
  }
  if (name.includes('soil') || name.includes('health card')) {
    return 'soil_health';
  }
  if (name.includes('mechanization') || name.includes('smam') || name.includes('tractor')) {
    return 'mechanization';
  }
  if (name.includes('horticulture') || name.includes('midh') || name.includes('fruit') || name.includes('vegetable')) {
    return 'horticulture';
  }
  if (name.includes('insurance') || name.includes('bima') || name.includes('fasal')) {
    return 'insurance';
  }
  if (name.includes('irrigation') || name.includes('sinchayee') || name.includes('water') || name.includes('jalyukta')) {
    return 'irrigation';
  }
  if (name.includes('women') || name.includes('mahila') || name.includes('mksp')) {
    return 'women_empowerment';
  }
  if (name.includes('seed') || name.includes('minikit')) {
    return 'seed_development';
  }
  if (name.includes('dairy') || name.includes('animal') || name.includes('goat') || name.includes('sheep') || name.includes('pashu')) {
    return 'animal_husbandry';
  }
  if (name.includes('group') || name.includes('cooperative') || name.includes('gat')) {
    return 'cooperative_farming';
  }
  
  return 'general';
}

// Extract scheme code from name
function extractSchemeCode(schemeName) {
  // Try to find common codes
  const codeMap = {
    'kisan credit card': 'KCC',
    'e-nam': 'ENAM',
    'pm-kisan': 'PM-KISAN',
    'pradhan mantri kisan': 'PM-KISAN',
    'paramparagat': 'PKVY',
    'soil health': 'SHC',
    'smam': 'SMAM',
    'mechanization': 'SMAM',
    'midh': 'MIDH',
    'fasal bima': 'PM-FASAL-BIMA',
    'pmfby': 'PMFBY',
    'krishi sinchayee': 'PMKSY',
    'pmksy': 'PMKSY',
    'mksp': 'MKSP',
    'seed minikit': 'SMSP',
    'nddb': 'NDDB',
    'dairy': 'NDDB',
  };
  
  const nameLower = schemeName.toLowerCase();
  for (const [key, code] of Object.entries(codeMap)) {
    if (nameLower.includes(key)) {
      return code;
    }
  }
  
  // Generate code from name
  const words = schemeName.split(/[\s\(\)]/).filter(w => w.length > 2);
  if (words.length >= 2) {
    return words.slice(0, 2).map(w => w.substring(0, 2).toUpperCase()).join('');
  }
  return words[0]?.substring(0, 4).toUpperCase() || 'SCHEME';
}

// Parse eligibility into array
function parseEligibility(eligibilityText) {
  if (!eligibilityText) return [];
  
  // Split by common patterns
  const items = eligibilityText
    .split(/[•\-\d+\.\)]/)
    .map(item => item.trim())
    .filter(item => item.length > 10 && !item.match(/^(step|to|the|a|an|and|or)$/i))
    .slice(0, 5); // Limit to 5 items
  
  if (items.length === 0) {
    // Try splitting by sentences
    const sentences = eligibilityText.split(/[\.;]/).filter(s => s.trim().length > 15);
    return sentences.slice(0, 3).map(s => s.trim());
  }
  
  return items;
}

// Parse required documents
function parseRequiredDocuments(applicationProcess, eligibility) {
  const docs = [];
  const text = (applicationProcess + ' ' + eligibility).toLowerCase();
  
  const docKeywords = {
    'aadhaar': 'Aadhaar Card',
    'voter id': 'Voter ID',
    'identity proof': 'Identity Proof',
    'address proof': 'Address Proof',
    'land document': 'Land Documents',
    'land record': 'Land Records',
    'bank account': 'Bank Account Details',
    'passport': 'Passport Size Photos',
    'caste certificate': 'Caste Certificate',
    'income certificate': 'Income Certificate',
    'residence proof': 'Residence Proof',
  };
  
  for (const [keyword, docName] of Object.entries(docKeywords)) {
    if (text.includes(keyword) && !docs.includes(docName)) {
      docs.push(docName);
    }
  }
  
  // If no documents found, add common ones
  if (docs.length === 0) {
    docs.push('Aadhaar Card', 'Bank Account Details', 'Land Documents');
  }
  
  return docs;
}

// Extract contact info
function extractContactInfo(contactInfo, description) {
  if (contactInfo) {
    // Extract phone numbers
    const phoneMatch = contactInfo.match(/(\d{10,13}|\d{4,5}-\d{6,8})/);
    if (phoneMatch) return phoneMatch[0];
  }
  
  // Try to find in description
  const desc = (description || '').toLowerCase();
  const phoneMatch = desc.match(/(\d{10,13}|\d{4,5}-\d{6,8})/);
  if (phoneMatch) return phoneMatch[0];
  
  return '';
}

// Extract deadline
function extractDeadline(applicationProcess, description) {
  const text = (applicationProcess + ' ' + description).toLowerCase();
  
  if (text.includes('open year-round') || text.includes('throughout the year')) {
    return 'Open year-round';
  }
  if (text.includes('kharif') && text.includes('rabi')) {
    return 'Varies by season (Kharif: July, Rabi: December)';
  }
  if (text.includes('kharif')) {
    return 'Kharif season (July)';
  }
  if (text.includes('rabi')) {
    return 'Rabi season (December)';
  }
  
  return 'Check with state agriculture department';
}

function transformSchemes() {
  try {
    console.log('📄 Reading schemes.json...');
    const content = fs.readFileSync(INPUT_FILE, 'utf-8');
    const schemes = JSON.parse(content);
    
    console.log(`Found ${schemes.length} schemes to transform\n`);
    
    const transformed = schemes.map((scheme, index) => {
      const schemeCode = extractSchemeCode(scheme.schemeName);
      const category = determineCategory(scheme.schemeName, scheme.description);
      const eligibility = parseEligibility(scheme.eligibility);
      const requiredDocs = parseRequiredDocuments(scheme.applicationProcess, scheme.eligibility);
      const contactNumber = extractContactInfo(scheme.contactInfo, scheme.description);
      const deadline = extractDeadline(scheme.applicationProcess, scheme.description);
      
      // Extract short name (remove state names, parentheses content)
      let schemeName = scheme.schemeName
        .replace(/\s*\([^)]*\)\s*/g, '') // Remove parentheses
        .replace(/\s*,\s*[A-Z][a-z]+$/, '') // Remove trailing state names
        .trim();
      
      // Limit description to reasonable length
      let description = scheme.description.substring(0, 500).trim();
      if (scheme.description.length > 500) {
        description += '...';
      }
      
      return {
        idx: index,
        id: uuidv4(),
        scheme_code: schemeCode,
        scheme_name: schemeName.substring(0, 100),
        full_name: scheme.schemeName,
        description: description,
        category: category,
        eligibility: eligibility.length > 0 ? eligibility : ['All farmers', 'As per scheme guidelines'],
        required_documents: requiredDocs,
        benefits: scheme.benefits.substring(0, 500).trim() || 'As per scheme guidelines',
        application_process: scheme.applicationProcess.substring(0, 500).trim() || 'Contact nearest agriculture office',
        official_website: scheme.website || '',
        deadline: deadline,
        is_active: true,
        contact_number: contactNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });
    
    // Save transformed data
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(transformed, null, 2), 'utf-8');
    
    console.log(`✅ Transformed ${transformed.length} schemes`);
    console.log(`💾 Saved to ${OUTPUT_FILE}\n`);
    console.log('📊 Sample transformed scheme:');
    console.log(JSON.stringify(transformed[0], null, 2).substring(0, 500));
    console.log('\n📝 Next step: Review the file and run: npm run import-data');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Check if uuid package is available
try {
  require('uuid');
  transformSchemes();
} catch (e) {
  console.log('Installing uuid package...');
  const { execSync } = require('child_process');
  execSync('npm install uuid', { stdio: 'inherit' });
  transformSchemes();
}

