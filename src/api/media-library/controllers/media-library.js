'use strict';

/**
 * index controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const dateFormat = require('dateformat');
const helper = require('../../helper');
const _ = require("lodash");
const uid = 'api::media-library.media-library'

module.exports = createCoreController(uid, ({strapi}) => ({
    async findOne(ctx) {

        // get user locale and library slug
        const lang = helper.getLang(ctx);
        const {id} = ctx.params;
    
        // query the database
        const fullPopulate = helper.getFullPopulateObject(uid, 4);
        let library = await strapi.db.query(uid).findOne({
            select: [
                'id',
                'slug_de',
                'slug_en',
                'event_year',
                `event_date`,
                `event_title`,
                'event_address',
                `topline`,
                `headline`,
                `text`,
                'patron_name',
                `patron_title`,
                `videos_headline`,
                `videos_more_headline`,
                `impressions_headline`,
                `media_libraries_more_headline`,
                `meta_title`,
                `meta_description`,
                `header_title`,
                `header_subtitle`,
                `header_subtitle_tag`,
                `header_text`,
              ],
              where: {locale: lang, [`slug_${lang}`] : id},
              populate: {
                'header_image': true,
                'patron_image': true,
                'video_list': fullPopulate.populate.video_list,
                'video_main': fullPopulate.populate.video_main,
                'impressions_images': fullPopulate.populate.impressions_images
              }
        })        
    
        // adjust some the data before outputting it
        if (library) {
    
          // set image to url only
          library.header_image = library.header_image && library.header_image.url ? library.header_image.url : '';
          library.patron_image = library.patron_image && library.patron_image.formats.small.url ? library.patron_image.formats.small.url : '';
    
          // reduce video data to only some attributes
          if (library.video_main && library.video_main.video) {
            library.video_main = await simplifyVideo(library.video_main.video, lang);
          }
    
          // reduce video data to only some attributes
          for (let i = 0; i < library.video_list.length; i++) {
            library.video_list[i] = await simplifyVideo(library.video_list[i].video, lang);
          }
    
          // categories from videos
          library.categories = [];
          for (let i = 0; i < library.video_list.length; i++) {
            if (library.video_list[i].tags && library.video_list[i].tags.length) {
              library.categories = _.union(library.categories, library.video_list[i].tags);
            }
          }
    
          // Impressions
          let images = [];
          for (let i = 0; i < library.impressions_images.length; i++) {
            if (library.impressions_images[i].image && library.impressions_images[i].image.url) {
              images.push({
                preview: library.impressions_images[i].image.formats && library.impressions_images[i].image.formats.medium ? library.impressions_images[i].image.formats.medium.url : library.impressions_images[i].image.url,
                large: library.impressions_images[i].image.formats && library.impressions_images[i].image.formats.large ? library.impressions_images[i].image.formats.large.url : library.impressions_images[i].image.url,
                title: library.impressions_images[i][`title`],
              });
            }
          }
          library.impressions_images = images;
    
          // other media libraries
          library.archives = [];
          const mlUid = 'api::event-media-library-page.event-media-library-page'
          const mlPopulate = helper.getFullPopulateObject(mlUid, 4);
          let eventMediaLibraryPage = await strapi.query(mlUid).findOne({where: {locale: lang}, populate: {
            media_libraries: mlPopulate.populate.media_libraries
          }});
          if (eventMediaLibraryPage && eventMediaLibraryPage.media_libraries && eventMediaLibraryPage.media_libraries.items.length) {
            library.archives = eventMediaLibraryPage.media_libraries.items.reduce(function (result, mediaLibrary) {
              if ((mediaLibrary.id !== library.id) && (mediaLibrary['list_image'] && mediaLibrary['list_image'].url)) {
                result.push(
                  {
                    'id': mediaLibrary.id,
                    'slug_de': mediaLibrary['slug_de'],
                    'slug_en': mediaLibrary['slug_en'],
                    'title': mediaLibrary['list_title'],
                    'subtitle': mediaLibrary['list_subtitle'],
                    'image': mediaLibrary['list_image'].url,
                  }
                );
              }
              return result;
            }, []);
          }
        }
    
        return library;
      },
}));

const simplifyVideo = async function (v, lang) {
    if (v) {
      let author = await strapi.db.query('api::author.author').findOne({where: {id: v.author?.id, locale: lang}});
      let group = await strapi.db.query('api::videos-group.videos-group').findOne({where: {id: v.videos_group?.id, locale: lang}});
  
      return {
        id: v.id,
        title: v[`title`],
        description: v[`description`],
        slug_de: v.slug_de,
        slug_en: v.slug_en,
        videos_group: {
          id: group.id,
          title: group['title'],
          slug_de: group.slug_de,
          slug_en: group.slug_en,
        },
        tags: v[`tags`] ? v[`tags`].split(',').map(i => i.trim()) : [],
        author: author ? author.fullname : '',
        duration: v.duration,
        video: v.video.url,
        type: 'video',
        premium: v.premium,
        highlight: v.highlight,
        img_list: v.img_list && v.img_list.url ? v.img_list.url : null,
        img_detail: v.img_detail && v.img_detail.url ? v.img_detail.url : null,
        timestamp: Date.parse(v.published),
        published: dateFormat(Date.parse(v.published), 'dd.mm.yyyy'),
      };
    }
  
    return {};
  };