const { sequelize } = require('../models');

async function up() {
  try {
    console.log('Running master tables migration up...');
    await sequelize.sync({ alter: true });
    console.log('✅ Master tables migration completed successfully.');
  } catch (error) {
    console.error('❌ Master tables migration failed:', error.message);
    throw error;
  }
}

async function down() {
  try {
    console.log('Running master tables migration down...');
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable('tblDropdownOptions');
    await queryInterface.dropTable('tblDropdownMaster');
    await queryInterface.dropTable('tblTaxMaster');
    console.log('✅ Master tables dropped successfully.');
  } catch (error) {
    console.error('❌ Dropping master tables failed:', error.message);
    throw error;
  }
}

module.exports = {
  up,
  down,
};
