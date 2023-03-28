/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	INCLUDES
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

"use strict";

const helper = require("../../../helper");
const {UID} = require("../../../uids");
const {indexList} = require("../../../autocomplete/constants");
const {elasticClient} = require("../../../helper");

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	ARTICLE MODEL
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

module.exports = {
  /////////////////////////////////
  // HOOKS
  /////////////////////////////////

  async beforeCreate(event) {
    const locale = event.params.data.locale;
    helper.createSlugs(event.params.data, locale);
  },

  async beforeUpdate(event) {
    const id = event.params.where.id;
    const uid = event.model.uid;
    const locale = await helper.getBeforeUpdateLocale(id, uid);
    helper.createSlugs(event.params.data, locale);
  },

  async afterCreate(event) {
    const row = event.params.data;
    row.id = event.result.id;

    await strapi.service(UID.autocomplete).indexOne(indexList.find(it => it.name === 'podcast'), row.id);
  },

  async afterUpdate(event) {
    const row = event.params.data;
    row.id = event.result.id;

    if (typeof row.img_list === 'object')         // Significance because of localization
      return;

    await strapi.service(UID.autocomplete).indexOne(indexList.find(it => it.name === 'podcast'), row.id);
  },

  async beforeDelete(event) {
    await elasticClient.delete({
      index: "podcast",
      id: event.params.where.id
    });
  },

  /*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
};
