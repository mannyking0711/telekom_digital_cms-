'use strict';

/**
 * podcast-group controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const uid = 'api::podcast-group.podcast-group'
const dateFormat = require('dateformat');
const helper = require('../../helper');

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx) {
        //console.log('podcast group find ctx =>', ctx);
        return await getPodcastGroups(ctx);
      },
    
      async findOne(ctx) {
        //console.log('podcast group findOne ctx =>', ctx);
        //console.log('podcast group findOne ctx =>');
        const lang = helper.getLang(ctx);
    
        let fields = [`description`];
        let related = ['img_detail'];
        let where = {};
        where[`slug_${lang}`] = ctx.params.id;
    
        let group = await getPodcastGroups(ctx, fields, related, where, 'fetch');
        group.podcasts = await strapi.controller('api::podcast.podcast').findByGroup(ctx, group.id);
    
        return group;
      },
}));

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	HELPER
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */


async function getPodcastGroups(ctx, addFields = [], addRelated = [], addWhere = {}, method) {
    //console.log('podcast group => getPodcastGroups');
  
    // get user locale
    const lang = helper.getLang(ctx);
    const today = dateFormat(Date.now(), 'yyyy-mm-dd');
  
    //
    let result = undefined;
    let fields = [
      'id',
      `title`,
      `label`,
      `subline`,
      'published',
      'slug_de',
      'slug_en',
      ...addFields
    ];
    let related = [
      'img_list',
      ...addRelated
    ];
    let where = {
      status: 'published',
      locale: lang,
      published: {
        $lte: today + "T23:59:59Z",
      },
      ...addWhere
    };
  
    // prepare query
    const baseQuery = {
        select: fields,
        where,
        orderBy: {published: 'DESC'},
        populate: related
    }
  
    // get data from database
    if (method === 'fetch') {
      result = await strapi.db.query(uid).findOne(baseQuery);
      result = formatResult(result);
    } else {
      result = await strapi.db.query(uid).findMany(baseQuery);
      result = result.map(formatResult);
    }
  
    return result;
  }
  
  function formatResult(group) {
  
    // default output format
    helper.defaultOutputFormat(group);
  
    // podcast groups don't have tags
    delete group.tags;
  
    // TODO sort podcasts
    if (group.podcasts) {
  
    }
  
    return group;
  }