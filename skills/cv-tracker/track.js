// CV Tracker CLI
// Usage: node track.js add --company "Stripe" --role "PM"

const company = process.argv[3] || 'Unknown';
const role = process.argv[5] || 'Unknown';

console.log(`Logging application: ${company} - ${role}`);

// TODO: POST to Supabase
console.log('Database entry created (mock)');
