/**
 * Final cleanup of benefits and application_process fields
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../data/schemes-refined.json');

function cleanBenefits(text) {
  if (!text || text.length < 20) {
    return 'Benefits as per scheme guidelines. Please contact the implementing agency for detailed information.';
  }
  
  // Remove section markers
  let cleaned = text
    .replace(/^[a-z]\.\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // If it starts mid-sentence, try to find a better start
  if (cleaned.match(/^[a-z]/) && cleaned.length > 100) {
    // Try to find a capital letter followed by meaningful text
    const betterStart = cleaned.match(/[A-Z][^.]{20,150}\./);
    if (betterStart) {
      cleaned = betterStart[0] + ' ' + cleaned.substring(betterStart.index + betterStart[0].length);
    }
  }
  
  // Limit length
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

function cleanApplicationProcess(text) {
  if (!text || text.length < 20) {
    return 'Contact nearest agriculture office or apply online through official portal.';
  }
  
  // Extract step-by-step if present
  const steps = text.match(/Step \d+[:\-]?[^\d]*/gi);
  if (steps && steps.length >= 2) {
    return steps.slice(0, 6).map((step, idx) => {
      const cleaned = step.replace(/Step \d+[:\-]?\s*/i, '').trim();
      return `Step ${idx + 1}: ${cleaned}`;
    }).join('\n\n');
  }
  
  // Clean regular text
  let cleaned = text.replace(/\s+/g, ' ').trim();
  
  // Limit length
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

function cleanupFields() {
  try {
    console.log('🧹 Cleaning up benefits and application_process fields...\n');
    
    const content = fs.readFileSync(FILE, 'utf-8');
    const schemes = JSON.parse(content);
    
    const cleaned = schemes.map(scheme => {
      scheme.benefits = cleanBenefits(scheme.benefits);
      scheme.application_process = cleanApplicationProcess(scheme.application_process);
      return scheme;
    });
    
    fs.writeFileSync(FILE, JSON.stringify(cleaned, null, 2), 'utf-8');
    
    console.log(`✅ Cleaned ${cleaned.length} schemes\n`);
    console.log('📋 Sample cleaned scheme:');
    console.log(`Benefits: ${cleaned[0].benefits.substring(0, 100)}...`);
    console.log(`Application: ${cleaned[0].application_process.substring(0, 100)}...\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupFields();

