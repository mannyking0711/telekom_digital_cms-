const { cloneDeepWith, camelCase, isObject, isString } = require('lodash');
const _ = require('lodash');
const pluralize = require('pluralize');

function migrateUids(uid) {
  if (!uid) {
    return uid;
  }
  var result = uid;
  result = result.replace('strapi::', 'admin::');
  result = result.replace('application::', 'api::');
  result = result.replace('plugins::users-permission', 'plugin::users-permissions');
  result = result.replace('plugins::', 'plugin::');
  
  //for "api::pluralname.pluralname" uids, apply same pluralize.singular function as codemods does in https://github.com/strapi/codemods/blob/5673120b8b3d4920d9d835776ee0308196b10628/lib/v4/migration-helpers/get-relation-object.js
  if (result.substring(0, 5) == 'api::') {
    const arrParts = result.substring(5).split('.');
    if (arrParts.length == 2) {
      result = `api::${_.kebabCase(pluralize.singular(arrParts[0]))}.${_.kebabCase(
        pluralize.singular(arrParts[1])
      )}`;
    }
  }
  return result;
}
const camelCaseUpdate = (string) => {
  if ( string === 'updated_at' ) return 'updatedAt'
  else if ( string === 'created_at' ) return 'createdAt'
  else if ( string.endsWith('_de') ) return string.slice(0, -3)
  else return string.replace(/\(DE\)/g, '')
}

function migrateItemValues(item) {
  return cloneDeepWith(item, (value, key) => {
    if (key === 'label' && !isObject(value)) {
      if ( item.layouts ) {
        return camelCaseUpdate(value);
      } else {
        return camelCase(value);
      }
    }
    if (key === 'uid' && !isObject(value)) {
      return migrateUids(value);
    }
  });
}

module.exports = {
  migrateUids,
  migrateItemValues,
};
