'use strict';

/**
 * Autocomplete Controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const uid = "api::autocomplete.autocomplete"
const { indexList } = require('../constants');

module.exports = createCoreController(uid, ({strapi}) => ({


  /////////////////////////////////
  // Autocomplete
  /////////////////////////////////
  async autocomplete(ctx) {
    const {q, lang, c} = ctx.request.query;

    if (!["article", "digi", "speaker", "podcast", "partner", "video", "magazine", "all"].find(i => i===c))
      return [];
    else {
      return strapi.service(uid).commonSearch(
        q, lang === "en" ? "en" : "de", c
      );
    }
  },




  /////////////////////////////////
  // Full-Text Search
  /////////////////////////////////
  async search(ctx) {
    const {q, lang, c, page} = ctx.request.query;

    if (!["article", "digi", "speaker", "podcast", "partner", "video", "all"].find(i => i===c))
      return [];
    else {
      return strapi.service(uid).wholeTitleSearch(
        q, lang === "en" ? "en" : "de", c, parseInt(page.toString())
      );
    }
  },




  /////////////////////////////////
  // Magazine Search
  /////////////////////////////////
  async magazineSearch(ctx) {
    const {q, lang, c, page} = ctx.request.query;

    if (!["article", "podcast", "video", "magazine"].find(i => i===c))
      return [];
    else {
      return strapi.service(uid).wholeTitleSearch(
        q, lang === "en" ? "en" : "de", c, parseInt(page.toString())
      );
    }
  },





  /////////////////////////////////
  // Test ES
  /////////////////////////////////
  async getElasticHealth() {
    try {
      return strapi.service(uid).getIndexHealth();
    } catch (e) {
      return 'error';
    }
  },






  /////////////////////////////////
  // Seed
  /////////////////////////////////
  // async seed(ctx) {
  //   const {q} = ctx.request.query;
  //   const qe = indexList.find(i => i.name === q);
  //   const idx = qe ? [qe] : indexList;
  //
  //   strapi.log.info('---------- Start Creating Indexes ');
  //
  //   for (let i = 0; i < idx.length; i ++) {
  //     const created = await strapi.service(uid).createIndex(idx[i].name);
  //     if (!created) {
  //       strapi.log.error(`Index '${idx[i].name}' not created`);
  //     } else {
  //       strapi.log.info(`Index '${idx[i].name}' created.`)
  //     }
  //   }
  //
  //   strapi.log.info('---------- End Creating Indexes ');
  //
  //
  //   return "See logs in detail";
  // },




  /////////////////////////////////
  // Migrate
  /////////////////////////////////
  // async migrate(ctx) {
  //   const {q} = ctx.request.query;
  //
  //   if (q === undefined || q === 'all') {
  //     for (let i = 0; i < indexList.length; i++) {
  //       await strapi.service(uid).migrateFromMySQL(indexList[i].name);
  //     }
  //   } else {
  //     await strapi.service(uid).migrateFromMySQL(q);
  //   }
  //
  //   return "OK";
  // },



  /////////////////////////////////
  // Cron Test
  /////////////////////////////////
  async cronTest(ctx) {

    // START Indices Health Check
    let healths;
    try {
      healths = await strapi.service(uid).getIndexHealth();
    } catch (e) {
      strapi.log.error('Cron Failed: ES Connection Lost. Check the network or ES service.');
      return 'connection error';
    }
    // END Indices Health Check

    // START Cron Index
    strapi.log.info('---------- Cron Index Started');

    const lastUpdateTime = await strapi.service(uid).getLastIndexTime();
    const indexStartDateTime = new Date();

    for (let i = 0; i < indexList.length; i ++) {

      const iterator = indexList[i];

      if (healths.find(it => it.index === iterator.name) === undefined)
        await strapi.service(uid).createIndex(iterator.name);

      await strapi.service(uid).migrateFromMySQL(iterator.name, lastUpdateTime, indexStartDateTime);

    }

    await strapi.service(uid).create({
      data: {
        update_st_dt: indexStartDateTime.toISOString(),
        update_en_dt: new Date().toISOString()
      }
    });

    strapi.log.info('---------- Cron Index Finished');
    // END Cron Index

    return 'tested';
  }



}));
