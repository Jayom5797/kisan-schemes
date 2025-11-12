/**
 * Improve eligibility parsing from original data
 */

const fs = require('fs');
const path = require('path');

const ORIGINAL_FILE = path.join(__dirname, '../data/schemes.json');
const REFINED_FILE = path.join(__dirname, '../data/schemes-refined.json');

function extractEligibilityFromOriginal(originalEligibility, originalDescription, originalApplication) {
  const combined = ((originalEligibility || '') + ' ' + (originalDescription || '') + ' ' + (originalApplication || '')).toLowerCase();
  
  const eligibilityItems = [];
  
  // Common eligibility patterns
  const patterns = [
    {
      regex: /(?:all|every|any)\s+farmers?/i,
      text: 'All farmers'
    },
    {
      regex: /small\s+and\s+marginal\s+farmers?/i,
      text: 'Small and marginal farmers'
    },
    {
      regex: /land\s+holding\s+(?:up\s+to|below|less\s+than)\s+(\d+)\s*hectares?/i,
      text: (match) => `Land holding up to ${match[1]} hectares`
    },
    {
      regex: /(?:sc|scheduled\s+caste|st|scheduled\s+tribe)/i,
      text: 'SC/ST farmers'
    },
    {
      regex: /women\s+farmers?/i,
      text: 'Women farmers'
    },
    {
      regex: /tenant\s+farmers?/i,
      text: 'Tenant farmers'
    },
    {
      regex: /sharecroppers?/i,
      text: 'Sharecroppers'
    },
    {
      regex: /age\s+between\s+(\d+)\s*(?:and|-|to)\s+(\d+)\s*years?/i,
      text: (match) => `Age between ${match[1]} and ${match[2]} years`
    },
    {
      regex: /residents?\s+of\s+([a-z\s]+?)(?:\.|,|$)/i,
      text: (match) => `Residents of ${match[1].trim()}`
    },
    {
      regex: /engaged\s+in\s+(agriculture|farming|horticulture|animal\s+husbandry)/i,
      text: (match) => `Engaged in ${match[1]}`
    },
    {
      regex: /(?:bpl|below\s+poverty\s+line)/i,
      text: 'Below Poverty Line (BPL) families'
    },
    {
      regex: /landless\s+(?:farmers?|laborers?)/i,
      text: 'Landless farmers/laborers'
    }
  ];
  
  for (const pattern of patterns) {
    const match = combined.match(pattern.regex);
    if (match) {
      const text = typeof pattern.text === 'function' ? pattern.text(match) : pattern.text;
      if (!eligibilityItems.includes(text)) {
        eligibilityItems.push(text);
      }
    }
  }
  
  // Also try to extract from structured text
  const structuredMatch = originalEligibility?.match(/(?:must|should|required|eligible|qualify).{20,200}/gi);
  if (structuredMatch) {
    structuredMatch.slice(0, 3).forEach(item => {
      const cleaned = item.trim().substring(0, 150);
      if (cleaned.length > 20 && !eligibilityItems.some(e => e.toLowerCase().includes(cleaned.toLowerCase().substring(0, 20)))) {
        eligibilityItems.push(cleaned);
      }
    });
  }
  
  // Default if nothing found
  if (eligibilityItems.length === 0) {
    return ['All farmers', 'As per scheme guidelines'];
  }
  
  // Limit to 5 items
  return eligibilityItems.slice(0, 5);
}

function improveEligibility() {
  try {
    console.log('🔧 Improving eligibility parsing...\n');
    
    // Read both files
    const originalContent = fs.readFileSync(ORIGINAL_FILE, 'utf-8');
    const originalSchemes = JSON.parse(originalContent);
    
    const refinedContent = fs.readFileSync(REFINED_FILE, 'utf-8');
    const refinedSchemes = JSON.parse(refinedContent);
    
    // Create a map of original schemes by name
    const originalMap = new Map();
    originalSchemes.forEach(scheme => {
      const key = scheme.schemeName.toLowerCase().substring(0, 50);
      originalMap.set(key, scheme);
    });
    
    // Update refined schemes with better eligibility
    const improved = refinedSchemes.map((scheme, index) => {
      const key = scheme.full_name.toLowerCase().substring(0, 50);
      const original = originalMap.get(key);
      
      if (original) {
        // Extract better eligibility
        scheme.eligibility = extractEligibilityFromOriginal(
          original.eligibility,
          original.description,
          original.applicationProcess
        );
      } else {
        // Try to find by partial match
        for (const [origKey, origScheme] of originalMap.entries()) {
          if (key.includes(origKey.substring(0, 20)) || origKey.includes(key.substring(0, 20))) {
            scheme.eligibility = extractEligibilityFromOriginal(
              origScheme.eligibility,
              origScheme.description,
              origScheme.applicationProcess
            );
            break;
          }
        }
      }
      
      // Ensure we have at least 2 items
      if (scheme.eligibility.length < 2) {
        scheme.eligibility.push('As per scheme guidelines');
      }
      
      scheme.idx = index;
      return scheme;
    });
    
    // Save improved data
    fs.writeFileSync(REFINED_FILE, JSON.stringify(improved, null, 2), 'utf-8');
    
    console.log(`✅ Improved eligibility for ${improved.length} schemes\n`);
    
    // Show sample
    console.log('📋 Sample improved scheme:');
    const sample = improved[0];
    console.log(`Scheme: ${sample.scheme_name}`);
    console.log(`Eligibility: ${JSON.stringify(sample.eligibility, null, 2)}`);
    console.log(`Website: ${sample.official_website}`);
    console.log(`Contact: ${sample.contact_number}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

improveEligibility();

