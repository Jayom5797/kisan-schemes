/**
 * Script to clean up the extracted JSON data
 * Removes leading colons, trims extra whitespace, and fixes common issues
 */

const fs = require('fs');
const path = require('path');

const JSON_FILE = path.join(__dirname, '../data/schemes.json');

function cleanup() {
  try {
    console.log('🧹 Cleaning up JSON data...');
    
    const content = fs.readFileSync(JSON_FILE, 'utf-8');
    const schemes = JSON.parse(content);
    
    let cleaned = 0;
    
    schemes.forEach((scheme, index) => {
      // Clean scheme name
      if (scheme.schemeName) {
        const original = scheme.schemeName;
        scheme.schemeName = scheme.schemeName
          .replace(/^:\s*/, '') // Remove leading colon
          .replace(/^[-•]\s*/, '') // Remove leading bullet
          .trim();
        if (original !== scheme.schemeName) {
          cleaned++;
        }
      }
      
      // Clean department (take first 100 chars if too long)
      if (scheme.department && scheme.department.length > 200) {
        // Try to extract just the department name
        const deptMatch = scheme.department.match(/(?:Department|Ministry|Government) of ([^,\.]+)/i);
        if (deptMatch) {
          scheme.department = deptMatch[1].trim();
        } else {
          scheme.department = scheme.department.substring(0, 100).trim();
        }
      }
      
      // Ensure required fields are not empty
      if (!scheme.description || scheme.description.length < 50) {
        console.warn(`⚠️  Scheme ${index + 1} (${scheme.schemeName}) has short description`);
      }
      
      // Trim all string fields
      Object.keys(scheme).forEach(key => {
        if (typeof scheme[key] === 'string') {
          scheme[key] = scheme[key].trim();
        }
      });
    });
    
    // Save cleaned data
    fs.writeFileSync(JSON_FILE, JSON.stringify(schemes, null, 2), 'utf-8');
    
    console.log(`✅ Cleaned ${cleaned} scheme names`);
    console.log(`✅ Total schemes: ${schemes.length}`);
    console.log(`💾 Saved cleaned data to ${JSON_FILE}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanup();

