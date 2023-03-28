const { mapKeys, camelCase, omit, pickBy } = require('lodash');
const { dbV3, dbV4, isSQLITE, dbV3withSchema } = require('../config/database');
const { BATCH_SIZE } = require('./helpers/constants');
const { apiTokenEntry } = require('./helpers/coreStoreHelpers');
const { resetTableSequence } = require('./helpers/migrate');
const { migrateItems } = require('./helpers/migrateFields');
const { migrateUids, migrateItemValues } = require('./helpers/migrateValues');
const { resolveSourceTableName, resolveDestTableName } = require('./helpers/tableNameHelpers');

const source = 'core_store';
const destination = 'strapi_core_store_settings';

const processedTables = [source];

const removeDe = (string) => {
  if ( !string.endsWith('_de') || string === 'slug_de' ) {
    return string
  } else {
    return string.slice(0, -3)
  }
}

const camelCaseUpdate = (string) => {
  if ( string === 'updated_at' ) return 'updatedAt'
  else if ( string === 'created_at' ) return 'createdAt'
  else return string
}

async function migrateTables() {
  console.log('Migrating Core Store');
  const sourceSelect = dbV3(resolveSourceTableName(source)).whereNot('key', 'like', 'model_def%');

  const count =
    (await sourceSelect.clone().count().first()).count ||
    (await sourceSelect.clone().count().first())['count(*)'];

  const countTotal =
    (await dbV3(resolveSourceTableName(source)).count().first()).count ||
    (await dbV3(resolveSourceTableName(source)).count().first())['count(*)'];
  console.log(`Migrating ${count}/${countTotal} items from ${source} to ${destination}`);

  const { id: _id1, ...apiTokenEntry } = await dbV4(resolveDestTableName(destination))
    .where('key', 'plugin_content_manager_configuration_content_types::admin::api-token')
    .first();

  const { id: _id2, ...strapiContentTypesSchema } = await dbV4(resolveDestTableName(destination))
    .where('key', 'strapi_content_types_schema')
    .first();
  await dbV4(resolveDestTableName(destination)).del();
  for (var page = 0; page * BATCH_SIZE < count; page++) {
    console.log(`${source} batch #${page + 1}`);
    const items = await sourceSelect
      .clone()
      .limit(BATCH_SIZE)
      .offset(page * BATCH_SIZE);
      const migratedItems = migrateItems(items, (item) => {
        const replacedValue = item.value
        .replace(/"defaultSortBy":"type"/g, `"defaultSortBy":"action"`)
        .replace(/"mainField":"type"/g, `"mainField":"action"`);
        const value = migrateItemValues(JSON.parse(replacedValue));
        // console.log(items.filter(i => i.key === 'plugin_content_manager_configuration_content_types::application::author.author'))

      if (value.layouts) {
        value.layouts.list = value.layouts.list.map((item) => camelCaseUpdate(item));
        value.layouts.edit = value.layouts.edit.map((row) =>
          row.map((column) => ({ ...column, name: camelCaseUpdate(removeDe(column.name)) })).filter((column) => ( column.name === 'slug_en' || !column.name.endsWith("_en") ) ? true : false )
        );
      }

      const valueToSave = value.metadatas
        ? {
            ...value,
            metadatas: pickBy(mapKeys(
              omit(value.metadatas, ['type', 'controller', 'policy', 'enabled']),
              (_, m) => camelCaseUpdate(removeDe(m))
            ), (value, key) => {
              return ( key === 'slug_en' || !key.endsWith("_en") ) ? true : false } )
          }
        : value;

      return {
        key: migrateUids(item.key),
        value: JSON.stringify(valueToSave),
        type: item.type,
        environment: item.environment ? item.environment : null,
        tag: item.tag ? item.tag : null,
      };
    });

    await dbV4(resolveDestTableName(destination)).insert(migratedItems);
  }

  await resetTableSequence(destination);
  await dbV4(resolveDestTableName(destination)).insert(apiTokenEntry);
  await dbV4(resolveDestTableName(destination)).insert(strapiContentTypesSchema);
}

const migrateCoreStore = {
  processedTables,
  migrateTables,
};

module.exports = {
  migrateCoreStore,
};
