'use strict';

/**
 * recommendation controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const uid = 'api::recommendation.recommendation'
var helper = require('../../helper');

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx) {

        // setup
        const lang = helper.getLang(ctx);
        const tags = ctx.query.tags ? ctx.query.tags.split(',') : [];
        const id = ctx.query.id;
        let recommendations = [];

    
        // validate user input
        if (!['de', 'en'].includes(lang)) return [];
    
        // find one article, one podcast and one video to recommend
        for (const type of ['article', 'podcast', 'video']) {
    
          // define selected and returned data
          const fullPopulate = helper.getFullPopulateObject(`api::${type}.${type}`, 4);
          let columns = [
            'id',
            'published',
            `tags`,
            `title`,
            'slug_de',
            'slug_en',
            'premium',
          ];
          let withRelated = {
            author: {
              select: ['id', 'fullname']
            },
            img_list: true,
            content: fullPopulate.populate.content
          };
          if ( fullPopulate.populate.appearances ) {
            withRelated['appearances'] = fullPopulate.populate.appearances
          }
    
          // article need additional data
          if (type === 'article') {
            
            withRelated.articles_group = {
              select : ['id', `title`, 'slug_de', 'slug_en']
            };
          }
    
          // podcasts need additional data
          if (type === 'podcast') {
            withRelated.podcast_group = {
              select : ['id', `title`, 'slug_de', 'slug_en']
            };
          }
    
          // video need additional data
          if (type === 'video') {
            withRelated.videos_group = {
              select : ['id', `title`, 'slug_de', 'slug_en']
            };
          }
    
          // try to find entities with matching tags
          // TODO FIX : populate based on type more content
          const queryType = `api::${type}.${type}`
          let entity = await strapi.db
            .query(queryType).findOne({
                select: columns,
                populate: withRelated,
                where: createWhereQuery(lang, {id, highlight: false, tags}),
                orderBy: {'published': 'DESC'}
            })
    
          // if no entity has a matching tag find the newest highlight
          if (!entity) {
            entity = await strapi.db
              .query(queryType).findOne({
                select: columns,
                populate: withRelated,
                where: createWhereQuery(lang, {id, highlight: true}),
                orderBy: {'published': 'DESC'}
              })
          }
    
          // if there are no highlights find the newest general item
          if (!entity) {
            entity = await strapi.db
              .query(queryType).findOne({
                select: columns,
                populate: withRelated,
                where: createWhereQuery(lang, {id}),
                orderBy: {'published': 'DESC'}
              })
          }
    
          // modify data before outputting it
          if (entity) {
    
            entity.type = type;
            helper.defaultOutputFormat(entity);
            recommendations.push(entity);
          }
        }
    
        // send the recommendations array to the client
        return recommendations;
      },
}));

// create a query that will find a fitting entity
function createWhereQuery(lang, options = {}) {

    const where = {locale: lang, status: 'published'}

    // if (options.id) qb.andWhereNot('id', options.id);
    if (options.id) where['id'] = {$ne: options.id}
    // if (options.tags) options.tags.forEach(tag => qb.andWhere(`tags`, 'like', `%${tag}%`));
    
    // TODO_FIX : Fix This to set where for tags , now its setting the last one
    if (options.tags) {
        where['tags'] = {}
        options.tags.forEach(tag =>
            // tag => qb.andWhere(`tags`, 'like', `%${tag}%`)
            where['tags']['$containsi'] = `%${tag}%`
    
        );
    } 
    if (options.highlight) where['highlight'] = true
  
    return where;
  }