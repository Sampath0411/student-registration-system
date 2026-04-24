const Admin = require('../models/Admin');
const FormSettings = require('../models/FormSettings');

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@studentreg.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';

  const existing = await Admin.findOne({ email });
  if (!existing) {
    await Admin.create({ email, password, name: 'System Admin' });
    console.log(`Admin seeded: ${email}`);
  }

  const settings = await FormSettings.findOne();
  if (!settings) {
    await FormSettings.create({});
    console.log('Default form settings created');
  }
}

module.exports = { seedAdmin };
