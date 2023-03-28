const { dbV3, dbV4 } = require('../config/database');
const { migrateAdmin } = require("./migrateAdmin");
const { migrateFiles } = require("./migrateFiles");
const { migrateUsers } = require('./migrateUsers');
const { migrateCoreStore } = require('./migrateCoreStore');

const migrations = [
  migrateCoreStore,
  migrateAdmin,
  migrateFiles,
  migrateUsers,
];

async function migrate(config) {

  await dbV4.raw("SET FOREIGN_KEY_CHECKS=0;");



  const processedTables = [];
  for (const migration of migrations) {
    await migration.migrateTables();
    processedTables.push(...migration.processedTables);
  }

  // Add de as default language
  await dbV4('i18n_locale').insert([{
    id: 2,
    name: 'German (de)',
    code: 'de',
    created_at: '2023-01-03 19:34:08.983000',
    updated_at: '2023-01-03 19:34:08.983000'
  }]);

  await dbV4('strapi_core_store_settings').insert([{ key: 'plugin_i18n_default_locale', value: '"de"', type: 'string' }])

  await dbV4.raw("SET FOREIGN_KEY_CHECKS=1;");
}

module.exports = {
  migrate,
};
