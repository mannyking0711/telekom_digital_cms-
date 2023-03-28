'use strict';

/**
 * podcast controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const uid = 'api::podcast.podcast'
const dateFormat = require('dateformat');
const helper = require('../../helper');

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx, where = {}) {
        //console.log('podcast ctx =>', ctx);
    
        // get user locale
        var lang = helper.getLang(ctx);
    
        // config database query
        var columns = [
          'id',
          'title',
          'tags',
          'description',
          'highlight',
          'published',
          'slug_de',
          'slug_en',
          'duration',
          'premium',
          'episode_number'
        ];
        var relations = {
          'img_list': true,
          'img_detail': true,
          'podcast_group': {
            select : ['id', `title`, 'slug_de', 'slug_en']
          },
          'appearances': {
            populate: {
                image: true
            }
          },
        };
        let today = dateFormat(Date.now(), 'yyyy-mm-dd')
        var where = {      title: {
            $notNull: true,
            $ne: "",
          },
          published: {
            $lte: today + "T23:59:59Z",
          },
          status: 'published', locale: lang, ...where};

          let queryObj = {
            select: columns,
            where,
            populate: relations,
            orderBy: {'published': 'DESC'},
            
        }

        if ( ctx.query.limit ) {
            queryObj['limit'] = ctx.query.limit
        }
    
        // get data from database
        var result = await strapi.db.query(uid).findMany(queryObj)
    
        // modify data after database query
        return result.map(entity => {
    
          // default output format
          helper.defaultOutputFormat(entity);
    
          // set content type
          entity.type = 'podcast';
    
          // [workaround] remove content cols
          delete entity.content_de;
          delete entity.content_en;
          delete entity.img_detail;
    
          return entity;
        });
      },
    
    
      /////////////////////////////////
      // FIND / LIST BY GROUP
      /////////////////////////////////
    
      async findByGroup(ctx, groupId) {
        //console.log('podcast groupId =>' + groupId);
        return this.find(ctx, {'podcast_group': groupId})
      },
    
    
      /////////////////////////////////
      // DETAIL
      /////////////////////////////////
    
      async findOne(ctx) {
        //console.log('podcast ctx.params =>', ctx.params);
    
        // validate user input
        const {id} = ctx.params;
    
        // get user locale
        var lang = helper.getLang(ctx);
    
        // get query parameter preview_secret (preview draft records)
        const isPreviewDraft = ctx.request.query.preview_secret === strapi.config.get('frontend.preview_secret');
    
        // config database query
        var columns = [
          'id',
          'title',
          'tags',
          'highlight',
          'published',
          'slug_de',
          'slug_en',
          'duration',
          'description',
          'shownotes',
          'premium',
          'meta_description',
          'structured_data',
          'link_spotify',
          'link_apple',
          'link_deezer',
          'link_amazon',
          'episode_number'
        ];
        var today = dateFormat(Date.now(), 'yyyy-mm-dd');
        var where = {[`slug_${lang}`]: id, locale: lang,
        published: {
          $lte: today + "T23:59:59Z",
        },
      };
        if (isPreviewDraft === false) {
          where.status = 'published';
        }
        var relations = {'img_detail': true, 'file': true, 'podcast_group': true, 'appearances': {
          populate: {
            image: true
          }
        }};
    
        // get data from database
        var result = await strapi.db.query(uid).findOne({
          select: columns,
          where,
          populate: relations
        })
    
        if ( !result ) {
          return ctx.response.notFound();
        }
    
        // default output format
        helper.defaultOutputFormat(result);
    
        // set content type
        result.type = 'podcast';
    
        // modify file property
        helper.defaultOutputFormat(result.file);
    
        // Has translation?
        result.translation = !!result.slug_en;
        
        // modify podcast group
        modifyPodcastGroup(result);
    
        // set appearance default image
        for (let i = 0; i < result.appearances.length; i++) {
          if (result.appearances[i].image && result.appearances[i].image.url) {
            result.appearances[i].image = result.appearances[i].image.url;
          } else {
            result.appearances[i].image = 'https://telekom-digitalx-content-develop.s3.eu-central-1.amazonaws.com/author_default_f026c96123.jpg';
          }
        }
    
        return result;
      },
}));

/////////////////////////////////
// HELPER
/////////////////////////////////

function modifyPodcastGroup(item) {
    //console.log('podcast item =>', item);
  
    // modify podcast group
    if (item.podcast_group) {
      item.podcast_group = {
        id: item.podcast_group.id,
        title: item.podcast_group['title'],
        label: item.podcast_group['label'],
        subline: item.podcast_group['subline'],
        slug_de: item.podcast_group.slug_de,
        slug_en: item.podcast_group.slug_en,
      };
    }
  }