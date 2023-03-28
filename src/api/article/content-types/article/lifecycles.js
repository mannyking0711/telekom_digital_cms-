/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	INCLUDES
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */


'use strict';

const helper = require('../../../helper');
const {elasticClient} = require("../../../helper");
const {indexList} = require("../../../autocomplete/constants");
const {UID} = require("../../../uids");


/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	ARTICLE MODEL
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */
const uid = "api::article.article"

module.exports = {


  /////////////////////////////////
  // HOOKS
  /////////////////////////////////

    async beforeCreate(event) {
      const data = event.params.data
      const locale = data.locale;
      helper.createSlugs(data, locale);
      const uid = event.model.uid

      await helper.validateRelation({uid, field: 'author', data: data.articles_group, message: 'Bitte fülle alle Felder aus: Author'})
      await helper.validateRelation({uid, field: 'articles_group', data: data.articles_group, message: 'Bitte fülle alle Felder aus: Article group'})
    },

    async beforeUpdate(event) {

      const data = event.params.data

      const id = event.params.where.id;
      const uid = event.model.uid
      const locale = await helper.getBeforeUpdateLocale(id, uid);
      helper.createSlugs(data, locale);

      await helper.validateRelation({uid, id, field: 'author', data: data.articles_group, message: 'Bitte fülle alle Felder aus: Author'})
      await helper.validateRelation({uid, id, field: 'articles_group', data: data.articles_group, message: 'Bitte fülle alle Felder aus: Article group'})
    },

    async afterCreate(event) {
      const row = event.params.data;
      row.id = event.result.id;

      await strapi.service(UID.autocomplete).indexOne(indexList.find(it => it.name === 'article'), row.id);
    },

    async afterUpdate(event) {
      const row = event.params.data;
      row.id = event.result.id;

      if (typeof row.img_list === 'object')         // Significance because of localization
        return;

      await strapi.service(UID.autocomplete).indexOne(indexList.find(it => it.name === 'article'), row.id);
    },

    async beforeDelete(event) {
      await elasticClient.delete({
        index: "article",
        id: event.params.where.id
      });
    },



  /*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

};
