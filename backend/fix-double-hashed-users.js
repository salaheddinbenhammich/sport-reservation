const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Define the User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  birthDate: Date,
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function fixDoubleHashedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users in database\n`);

    let fixedCount = 0;
    const testPasswords = ['Hie-2025', 'Password123!', 'Test123!', 'Admin123!'];

    for (const user of users) {
      console.log(`Checking user: ${user.username} (${user.email})`);
      
      // Try to identify if this user has a double-hashed password
      // by testing common passwords
      let isDoubleHashed = false;
      let correctPassword = null;

      for (const testPassword of testPasswords) {
        try {
          // First, try to compare with the stored hash directly
          const directMatch = await bcrypt.compare(testPassword, user.password);
          
          if (directMatch) {
            console.log(`  ✅ Direct match found with password: ${testPassword}`);
            isDoubleHashed = false;
            correctPassword = testPassword;
            break;
          }

          // If direct match fails, try double-hashing (hash the test password first, then compare)
          const singleHash = await bcrypt.hash(testPassword, 10);
          const doubleMatch = await bcrypt.compare(singleHash, user.password);
          
          if (doubleMatch) {
            console.log(`  ⚠️  Double-hashed password detected! Original password: ${testPassword}`);
            isDoubleHashed = true;
            correctPassword = testPassword;
            break;
          }
        } catch (error) {
          // Continue to next test password
        }
      }

      if (isDoubleHashed && correctPassword) {
        // Fix the double-hashed password by storing the correct single hash
        const correctHash = await bcrypt.hash(correctPassword, 10);
        await User.updateOne({ _id: user._id }, { password: correctHash });
        console.log(`  🔧 Fixed double-hashed password for ${user.username}`);
        fixedCount++;
      } else if (!correctPassword) {
        console.log(`  ❓ Could not identify password for ${user.username}`);
      } else {
        console.log(`  ✅ Password is correctly hashed for ${user.username}`);
      }
      
      console.log('  ---');
    }

    console.log(`\n🎉 Fixed ${fixedCount} users with double-hashed passwords`);
    console.log('\n📝 Note: If you have users with passwords not in the test list,');
    console.log('   you may need to ask them to reset their passwords.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Only run if called directly
if (require.main === module) {
  fixDoubleHashedUsers();
}

module.exports = { fixDoubleHashedUsers };
