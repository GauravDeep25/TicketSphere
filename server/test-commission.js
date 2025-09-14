import { calculateCommissions } from '../src/utils/commissionUtils.js';

// Test commission calculation
console.log('=== Commission System Test ===\n');

// Test with different ticket prices
const testPrices = [100, 500, 1000, 2500];

testPrices.forEach(price => {
  console.log(`Ticket Price: ₹${price}`);
  
  const commissions = calculateCommissions(price, 0.05, 0.05); // 5% each
  
  console.log(`  Seller Commission (5%): ₹${commissions.sellerCommissionAmount}`);
  console.log(`  Buyer Commission (5%): ₹${commissions.buyerCommissionAmount}`);
  console.log(`  Total Commission: ₹${commissions.totalCommissionAmount}`);
  console.log(`  Seller Receives: ₹${commissions.sellerReceives}`);
  console.log(`  Buyer Pays: ₹${commissions.buyerPays}`);
  console.log(`  Admin Earns: ₹${commissions.totalCommissionAmount}`);
  console.log('  ---');
});

console.log('\n=== Example Transaction Flow ===');
console.log('1. User lists ticket for ₹1000');
console.log('2. Buyer initiates payment');
console.log('3. System calculates:');
console.log('   - Seller pays ₹50 commission (5% of ₹1000)');
console.log('   - Buyer pays ₹50 commission (5% of ₹1000)');
console.log('   - Total buyer payment: ₹1050');
console.log('   - Seller receives: ₹950');
console.log('   - Admin receives: ₹100 total commission');
console.log('4. Commission is automatically added to admin balance');