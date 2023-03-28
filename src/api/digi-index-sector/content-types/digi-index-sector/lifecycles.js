'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

const {UID} = require("../../../uids");
const {indexList} = require("../../../autocomplete/constants");
const {elasticClient} = require("../../../helper");

module.exports = {

  async afterCreate(event) {
    const row = event.params.data;
    row.id = event.result.id;

    await strapi.service(UID.autocomplete).indexOne(indexList.find(it => it.name === 'digi'), row.id);
  },

  async afterUpdate(event) {
    const row = event.params.data;
    row.id = event.result.id;

    if (typeof row.img_list === 'object')         // Significance because of localization
      return;

    await strapi.service(UID.autocomplete).indexOne(indexList.find(it => it.name === 'digi'), row.id);
  },

  async beforeDelete(event) {
    await elasticClient.delete({
      index: "digi",
      id: event.params.where.id
    });
  },

};
