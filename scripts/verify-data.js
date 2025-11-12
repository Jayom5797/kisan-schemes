/**
 * Verify final data quality
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../data/schemes-refined.json');

const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'));

console.log('✅ Final Data Quality Check:\n');
console.log(`Total schemes: ${data.length}`);
console.log(`With websites: ${data.filter(s => s.official_website && s.official_website.length > 5).length}/${data.length}`);
console.log(`With contact: ${data.filter(s => s.contact_number && s.contact_number.length > 5).length}/${data.length}`);
console.log(`With eligibility (array): ${data.filter(s => Array.isArray(s.eligibility) && s.eligibility.length > 0).length}/${data.length}`);
console.log(`With documents (array): ${data.filter(s => Array.isArray(s.required_documents) && s.required_documents.length > 0).length}/${data.length}`);
console.log(`With benefits: ${data.filter(s => s.benefits && s.benefits.length > 20).length}/${data.length}`);
console.log(`With application process: ${data.filter(s => s.application_process && s.application_process.length > 20).length}/${data.length}`);

const categories = new Set(data.map(s => s.category));
console.log(`\n📊 Categories: ${categories.size}`);
console.log(`Categories: ${Array.from(categories).join(', ')}`);

console.log('\n📋 Sample scheme (first one):');
console.log(JSON.stringify(data[0], null, 2));

