/**
 * Utility script to create test accounts for Rentapp
 * 
 * Run this in your browser console after the app is loaded:
 * 
 * 1. Open your browser's Developer Console (F12)
 * 2. Copy and paste this entire script
 * 3. The accounts will be created in localStorage
 * 
 * Test Accounts:
 * - Member: member@test.com / password123
 * - Staff: staff@test.com / password123 (unapproved)
 * - Admin: admin@test.com / password123
 */

(function() {
  const USERS_KEY = 'rentapp_users';
  
  const createTestAccounts = () => {
    const timestamp = Date.now();
    
    // Load existing users
    const existingUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    // Check if accounts already exist
    const existingEmails = existingUsers.map(u => u.email.toLowerCase());
    
    const testAccounts = [
      {
        id: `${timestamp}-1`,
        name: 'Test Member',
        firstName: 'Test',
        lastName: 'Member',
        email: 'member@test.com',
        password: 'password123',
        role: 'tenant',
        profileImage: '/images/reed-richards.png',
        isApproved: undefined
      },
      {
        id: `${timestamp}-2`,
        name: 'Test Staff',
        firstName: 'Test',
        lastName: 'Staff',
        email: 'staff@test.com',
        password: 'password123',
        role: 'staff',
        profileImage: '/images/reed-richards.png',
        isApproved: false // Pending approval
      },
      {
        id: `${timestamp}-3`,
        name: 'Test Admin',
        firstName: 'Test',
        lastName: 'Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin',
        profileImage: '/images/reed-richards.png',
        isApproved: undefined
      }
    ];
    
    // Add only accounts that don't exist
    const newAccounts = testAccounts.filter(acc => 
      !existingEmails.includes(acc.email.toLowerCase())
    );
    
    if (newAccounts.length === 0) {
      console.log('✅ All test accounts already exist!');
      return;
    }
    
    // Add new accounts to existing users
    const allUsers = [...existingUsers, ...newAccounts];
    localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
    
    console.log('✅ Test accounts created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    newAccounts.forEach(acc => {
      console.log(`${acc.role.toUpperCase()}: ${acc.email} / ${acc.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Refresh the page and login with any of these accounts.');
  };
  
  try {
    createTestAccounts();
  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
  }
})();

