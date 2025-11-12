/**
 * Enhanced script to refine schemes data with proper fields and website links
 * 
 * Usage:
 * node scripts/refine-schemes.js
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const INPUT_FILE = path.join(__dirname, '../data/schemes.json');
const OUTPUT_FILE = path.join(__dirname, '../data/schemes-refined.json');

// Known scheme websites and details
const SCHEME_DATABASE = {
  'kisan credit card': {
    code: 'KCC',
    website: 'https://www.nabard.org/content1.aspx?id=494',
    contact: '1800-180-6060',
    category: 'credit',
    deadline: 'Open year-round'
  },
  'e-nam': {
    code: 'ENAM',
    website: 'https://www.enam.gov.in',
    contact: '1800-270-0224',
    category: 'market_linkage',
    deadline: 'Open year-round'
  },
  'pm-kisan': {
    code: 'PM-KISAN',
    website: 'https://pmkisan.gov.in',
    contact: '155261',
    category: 'income_support',
    deadline: 'Open year-round'
  },
  'pradhan mantri kisan': {
    code: 'PM-KISAN',
    website: 'https://pmkisan.gov.in',
    contact: '155261',
    category: 'income_support',
    deadline: 'Open year-round'
  },
  'paramparagat krishi': {
    code: 'PKVY',
    website: 'https://pgsindia-ncof.gov.in',
    contact: '011-23382012',
    category: 'organic_farming',
    deadline: 'Check with state agriculture department'
  },
  'soil health card': {
    code: 'SHC',
    website: 'https://soilhealth.dac.gov.in',
    contact: '1800-180-1551',
    category: 'soil_health',
    deadline: 'Open year-round'
  },
  'smam': {
    code: 'SMAM',
    website: 'https://agrimachinery.nic.in',
    contact: '011-23382012',
    category: 'mechanization',
    deadline: 'Open year-round'
  },
  'mechanization': {
    code: 'SMAM',
    website: 'https://agrimachinery.nic.in',
    contact: '011-23382012',
    category: 'mechanization',
    deadline: 'Open year-round'
  },
  'fasal bima': {
    code: 'PMFBY',
    website: 'https://pmfby.gov.in',
    contact: '14447',
    category: 'insurance',
    deadline: 'Varies by season (Kharif: July, Rabi: December)'
  },
  'pmfby': {
    code: 'PMFBY',
    website: 'https://pmfby.gov.in',
    contact: '14447',
    category: 'insurance',
    deadline: 'Varies by season (Kharif: July, Rabi: December)'
  },
  'krishi sinchayee': {
    code: 'PMKSY',
    website: 'https://pmksy.gov.in',
    contact: '011-23389714',
    category: 'irrigation',
    deadline: 'Open year-round'
  },
  'pmksy': {
    code: 'PMKSY',
    website: 'https://pmksy.gov.in',
    contact: '011-23389714',
    category: 'irrigation',
    deadline: 'Open year-round'
  },
  'rythu bandhu': {
    code: 'RYTHU-BANDHU',
    website: 'https://rythubandhu.telangana.gov.in',
    contact: '1800-425-0001',
    category: 'income_support',
    deadline: 'Open year-round'
  },
  'kalia': {
    code: 'KALIA',
    website: 'https://kalia.odisha.gov.in',
    contact: '155333',
    category: 'income_support',
    deadline: 'Open year-round'
  },
  'krishak bandhu': {
    code: 'KRISHAK-BANDHU',
    website: 'https://krishakbandhu.wb.gov.in',
    contact: '1800-345-5500',
    category: 'income_support',
    deadline: 'Open year-round'
  }
};

// Category mapping
function determineCategory(schemeName, description) {
  const name = schemeName.toLowerCase();
  const desc = (description || '').toLowerCase();
  const combined = name + ' ' + desc;
  
  // Check database first
  for (const [key, data] of Object.entries(SCHEME_DATABASE)) {
    if (combined.includes(key)) {
      return data.category;
    }
  }
  
  // Pattern matching
  if (combined.match(/credit|loan|kcc|financ/)) return 'credit';
  if (combined.match(/market|e-nam|nam|trading/)) return 'market_linkage';
  if (combined.match(/income|samman|bandhu|kalia|support|assistance/)) return 'income_support';
  if (combined.match(/organic|pkv|jeevamrutha|natural farm/)) return 'organic_farming';
  if (combined.match(/soil|health card/)) return 'soil_health';
  if (combined.match(/mechanization|smam|tractor|equipment/)) return 'mechanization';
  if (combined.match(/horticulture|midh|fruit|vegetable|spice/)) return 'horticulture';
  if (combined.match(/insurance|bima|fasal|coverage/)) return 'insurance';
  if (combined.match(/irrigation|sinchayee|water|jalyukta|pond/)) return 'irrigation';
  if (combined.match(/women|mahila|mksp|female/)) return 'women_empowerment';
  if (combined.match(/seed|minikit|variety/)) return 'seed_development';
  if (combined.match(/dairy|animal|goat|sheep|pashu|livestock|poultry/)) return 'animal_husbandry';
  if (combined.match(/group|cooperative|gat|fpo|collective/)) return 'cooperative_farming';
  
  return 'general';
}

// Extract scheme code
function extractSchemeCode(schemeName) {
  const nameLower = schemeName.toLowerCase();
  
  // Check database
  for (const [key, data] of Object.entries(SCHEME_DATABASE)) {
    if (nameLower.includes(key)) {
      return data.code;
    }
  }
  
  // Known patterns
  const patterns = {
    'kisan credit card': 'KCC',
    'e-nam': 'ENAM',
    'pm-kisan': 'PM-KISAN',
    'paramparagat': 'PKVY',
    'soil health': 'SHC',
    'smam': 'SMAM',
    'fasal bima': 'PMFBY',
    'pmfby': 'PMFBY',
    'krishi sinchayee': 'PMKSY',
    'pmksy': 'PMKSY',
    'rythu bandhu': 'RYTHU-BANDHU',
    'kalia': 'KALIA',
    'krishak bandhu': 'KRISHAK-BANDHU',
    'jalyukta shivar': 'JALYUKTA-SHIVAR',
    'gat sheti': 'GAT-SHETI',
    'jeevamrutha': 'JEEVAMRUTHA',
    'kisan maan-dhan': 'PM-KMY',
    'kisan maan dhan': 'PM-KMY',
  };
  
  for (const [pattern, code] of Object.entries(patterns)) {
    if (nameLower.includes(pattern)) {
      return code;
    }
  }
  
  // Generate from name
  const words = schemeName.split(/[\s\(\)]/).filter(w => w.length > 2 && !w.match(/^(scheme|yojana|abhiyan)$/i));
  if (words.length >= 2) {
    return words.slice(0, 2).map(w => w.substring(0, 3).toUpperCase()).join('-');
  }
  return words[0]?.substring(0, 6).toUpperCase() || 'SCHEME';
}

// Get website and contact from database
function getSchemeInfo(schemeName, description) {
  const combined = (schemeName + ' ' + (description || '')).toLowerCase();
  
  for (const [key, data] of Object.entries(SCHEME_DATABASE)) {
    if (combined.includes(key)) {
      return {
        website: data.website,
        contact: data.contact,
        deadline: data.deadline
      };
    }
  }
  
  // Try to extract website from description
  const urlMatch = description?.match(/https?:\/\/[^\s\)]+/);
  const phoneMatch = description?.match(/(\d{10,13}|\d{4,5}-\d{6,8}|1800-\d{3}-\d{4})/);
  
  return {
    website: urlMatch ? urlMatch[0] : '',
    contact: phoneMatch ? phoneMatch[0] : '',
    deadline: 'Check with state agriculture department'
  };
}

// Parse eligibility into clean array
function parseEligibility(text) {
  if (!text || text.length < 10) return ['All farmers', 'As per scheme guidelines'];
  
  // Split by common patterns
  let items = text
    .split(/[•\-\d+\.\)\n]/)
    .map(item => item.trim())
    .filter(item => {
      const trimmed = item.trim();
      return trimmed.length > 15 && 
             !trimmed.match(/^(step|to|the|a|an|and|or|some|many|this|that|these|those)$/i) &&
             !trimmed.match(/^[a-z]$/);
    });
  
  // If no good splits, try sentences
  if (items.length === 0 || items.length > 10) {
    items = text
      .split(/[\.;]/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 200)
      .slice(0, 5);
  }
  
  // Clean and limit
  items = items
    .map(item => item.replace(/^[:\-\s]+/, '').trim())
    .filter(item => item.length > 10)
    .slice(0, 5);
  
  if (items.length === 0) {
    return ['All farmers', 'As per scheme guidelines'];
  }
  
  return items;
}

// Parse required documents
function parseRequiredDocuments(applicationProcess, eligibility, description) {
  const text = ((applicationProcess || '') + ' ' + (eligibility || '') + ' ' + (description || '')).toLowerCase();
  const docs = [];
  
  const docMap = {
    'aadhaar': 'Aadhaar Card',
    'voter id': 'Voter ID',
    'identity proof': 'Identity Proof',
    'address proof': 'Address Proof',
    'land document': 'Land Documents',
    'land record': 'Land Records',
    'land ownership': 'Land Ownership Documents',
    'bank account': 'Bank Account Details',
    'passport': 'Passport Size Photos',
    'caste certificate': 'Caste Certificate',
    'income certificate': 'Income Certificate',
    'residence proof': 'Residence Proof',
    'ration card': 'Ration Card',
    'pan card': 'PAN Card',
    'sowing certificate': 'Sowing Certificate',
    'loan sanction': 'Loan Sanction Letter',
  };
  
  for (const [keyword, docName] of Object.entries(docMap)) {
    if (text.includes(keyword) && !docs.includes(docName)) {
      docs.push(docName);
    }
  }
  
  // Default documents if none found
  if (docs.length === 0) {
    return ['Aadhaar Card', 'Bank Account Details', 'Land Documents'];
  }
  
  return docs;
}

// Clean description
function cleanDescription(text) {
  if (!text) return 'Description not available';
  
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Limit length but try to end at sentence
  if (cleaned.length > 500) {
    cleaned = cleaned.substring(0, 500);
    const lastPeriod = cleaned.lastIndexOf('.');
    if (lastPeriod > 400) {
      cleaned = cleaned.substring(0, lastPeriod + 1);
    } else {
      cleaned += '...';
    }
  }
  
  return cleaned;
}

// Clean benefits
function cleanBenefits(text) {
  if (!text || text.length < 20) return 'Benefits as per scheme guidelines';
  
  // Remove section markers
  let cleaned = text
    .replace(/^[a-z]\.\s*/gm, '') // Remove "a. ", "b. " etc
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleaned.length > 500) {
    cleaned = cleaned.substring(0, 500);
    const lastPeriod = cleaned.lastIndexOf('.');
    if (lastPeriod > 400) {
      cleaned = cleaned.substring(0, lastPeriod + 1);
    } else {
      cleaned += '...';
    }
  }
  
  return cleaned;
}

// Clean application process
function cleanApplicationProcess(text) {
  if (!text || text.length < 20) return 'Contact nearest agriculture office or apply online';
  
  // Extract step-by-step if present
  const stepMatch = text.match(/Step \d+[:\-]?[^\d]*/gi);
  if (stepMatch && stepMatch.length >= 2) {
    return stepMatch.slice(0, 6).join('\n\n');
  }
  
  // Clean and limit
  let cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length > 500) {
    cleaned = cleaned.substring(0, 500);
    const lastPeriod = cleaned.lastIndexOf('.');
    if (lastPeriod > 400) {
      cleaned = cleaned.substring(0, lastPeriod + 1);
    } else {
      cleaned += '...';
    }
  }
  
  return cleaned;
}

// Extract short name
function extractShortName(fullName) {
  // Remove state names, parentheses content
  let short = fullName
    .replace(/\s*\([^)]*\)\s*/g, '')
    .replace(/\s*,\s*[A-Z][a-z]+$/, '')
    .replace(/\s*:\s*A Comprehensive Overview$/, '')
    .trim();
  
  // Limit length
  if (short.length > 80) {
    short = short.substring(0, 80).trim();
  }
  
  return short;
}

function refineSchemes() {
  try {
    console.log('📄 Reading schemes.json...');
    const content = fs.readFileSync(INPUT_FILE, 'utf-8');
    const schemes = JSON.parse(content);
    
    console.log(`Found ${schemes.length} schemes to refine\n`);
    
    const refined = schemes.map((scheme, index) => {
      const schemeCode = extractSchemeCode(scheme.schemeName);
      const category = determineCategory(scheme.schemeName, scheme.description);
      const schemeInfo = getSchemeInfo(scheme.schemeName, scheme.description);
      const eligibility = parseEligibility(scheme.eligibility);
      const requiredDocs = parseRequiredDocuments(scheme.applicationProcess, scheme.eligibility, scheme.description);
      
      return {
        idx: index,
        id: uuidv4(),
        scheme_code: schemeCode,
        scheme_name: extractShortName(scheme.schemeName),
        full_name: scheme.schemeName,
        description: cleanDescription(scheme.description),
        category: category,
        eligibility: eligibility,
        required_documents: requiredDocs,
        benefits: cleanBenefits(scheme.benefits),
        application_process: cleanApplicationProcess(scheme.applicationProcess),
        official_website: schemeInfo.website || scheme.website || '',
        deadline: schemeInfo.deadline || 'Check with state agriculture department',
        is_active: true,
        contact_number: schemeInfo.contact || extractContactNumber(scheme.contactInfo, scheme.description) || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });
    
    // Add additional common schemes if we have less than 35
    const additionalSchemes = getAdditionalSchemes();
    if (refined.length < 35) {
      const needed = 35 - refined.length;
      refined.push(...additionalSchemes.slice(0, needed));
    }
    
    // Save refined data
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(refined, null, 2), 'utf-8');
    
    console.log(`✅ Refined ${refined.length} schemes`);
    console.log(`💾 Saved to ${OUTPUT_FILE}\n`);
    
    // Statistics
    const withWebsites = refined.filter(s => s.official_website).length;
    const withContacts = refined.filter(s => s.contact_number).length;
    console.log(`📊 Statistics:`);
    console.log(`   - Schemes with websites: ${withWebsites}/${refined.length}`);
    console.log(`   - Schemes with contact: ${withContacts}/${refined.length}`);
    console.log(`   - Categories: ${new Set(refined.map(s => s.category)).size}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function extractContactNumber(contactInfo, description) {
  const text = ((contactInfo || '') + ' ' + (description || '')).toLowerCase();
  const phoneMatch = text.match(/(\d{10,13}|\d{4,5}-\d{6,8}|1800-\d{3}-\d{4}|155\d{3})/);
  return phoneMatch ? phoneMatch[0] : '';
}

function getAdditionalSchemes() {
  return [
    {
      idx: 999,
      id: uuidv4(),
      scheme_code: 'PM-KMY',
      scheme_name: 'Pradhan Mantri Kisan Maan-Dhan Yojana',
      full_name: 'Pradhan Mantri Kisan Maan-Dhan Yojana (PM-KMY)',
      description: 'Pension scheme for small and marginal farmers providing monthly pension of ₹3,000 after 60 years of age.',
      category: 'pension',
      eligibility: ['Small and marginal farmers', 'Age between 18-40 years', 'Land holding up to 2 hectares'],
      required_documents: ['Aadhaar Card', 'Bank Account Details', 'Land Documents', 'Age Proof'],
      benefits: 'Monthly pension of ₹3,000 after 60 years. Government contributes matching amount to pension fund.',
      application_process: 'Apply online through PM-KMY portal or visit nearest Common Service Center with required documents.',
      official_website: 'https://pmkmy.gov.in',
      deadline: 'Open year-round',
      is_active: true,
      contact_number: '1800-180-1551',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      idx: 999,
      id: uuidv4(),
      scheme_code: 'RKVY',
      scheme_name: 'Rashtriya Krishi Vikas Yojana',
      full_name: 'Rashtriya Krishi Vikas Yojana (RKVY)',
      description: 'Centrally sponsored scheme for comprehensive development of agriculture and allied sectors with focus on increasing production and productivity.',
      category: 'general',
      eligibility: ['All farmers', 'Farmer groups', 'FPOs', 'State governments'],
      required_documents: ['Aadhaar Card', 'Bank Account', 'Project Proposal', 'Land Documents'],
      benefits: 'Financial assistance for infrastructure, technology adoption, and capacity building. Focus on crop diversification and value addition.',
      application_process: 'Apply through State Agriculture Department or District Agriculture Office with project proposal.',
      official_website: 'https://rkvy.nic.in',
      deadline: 'Check with state agriculture department',
      is_active: true,
      contact_number: '011-23389714',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      idx: 999,
      id: uuidv4(),
      scheme_code: 'NHM',
      scheme_name: 'National Horticulture Mission',
      full_name: 'National Horticulture Mission (NHM)',
      description: 'Mission for holistic development of horticulture sector covering fruits, vegetables, flowers, spices, and plantation crops.',
      category: 'horticulture',
      eligibility: ['Individual farmers', 'Farmer groups', 'SHGs', 'FPOs engaged in horticulture'],
      required_documents: ['Aadhaar Card', 'Bank Account', 'Land Documents', 'Project Proposal'],
      benefits: 'Subsidy for planting material, irrigation, post-harvest infrastructure, and marketing support. Up to 50% subsidy for various components.',
      application_process: 'Apply through State Horticulture Mission or District Horticulture Office with project details.',
      official_website: 'https://midh.gov.in',
      deadline: 'Check with state horticulture department',
      is_active: true,
      contact_number: '011-23070382',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      idx: 999,
      id: uuidv4(),
      scheme_code: 'AIF',
      scheme_name: 'Agriculture Infrastructure Fund',
      full_name: 'Agriculture Infrastructure Fund (AIF)',
      description: 'Financing facility for investment in viable projects for post-harvest management infrastructure and community farming assets.',
      category: 'infrastructure',
      eligibility: ['FPOs', 'Agri-entrepreneurs', 'Startups', 'Central/State agencies', 'Local bodies'],
      required_documents: ['Aadhaar Card', 'Bank Account', 'Project Proposal', 'Land Documents', 'Business Registration'],
      benefits: 'Interest subvention of 3% per annum up to ₹2 crore. Credit guarantee coverage for loans up to ₹2 crore.',
      application_process: 'Apply through eligible lending institutions (banks, NBFCs) with detailed project report.',
      official_website: 'https://agriinfra.dac.gov.in',
      deadline: 'Open year-round',
      is_active: true,
      contact_number: '011-23382012',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      idx: 999,
      id: uuidv4(),
      scheme_code: 'MKSP',
      scheme_name: 'Mahila Kisan Sashaktikaran Pariyojana',
      full_name: 'Mahila Kisan Sashaktikaran Pariyojana (MKSP)',
      description: 'Sub-component of National Rural Livelihood Mission focusing on empowering women farmers through improved access to resources and training.',
      category: 'women_empowerment',
      eligibility: ['Women farmers', 'Women SHGs', 'Women engaged in agriculture and allied activities'],
      required_documents: ['Aadhaar Card', 'Bank Account', 'Land Documents (if available)', 'SHG Certificate'],
      benefits: 'Training, capacity building, improved farm inputs, market linkage support, and access to credit facilities.',
      application_process: 'Apply through State Rural Livelihood Mission or District Agriculture Office.',
      official_website: 'https://rkvy.nic.in/mksp',
      deadline: 'Check with state agriculture department',
      is_active: true,
      contact_number: '011-23389714',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];
}

// Run refinement
refineSchemes();

