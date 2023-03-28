'use strict';

/**
 * event-media-library-page controller
 */

const { createCoreController } = require('@strapi/strapi').factories;


const helper = require('../../helper');
const uid = 'api::event-media-library-page.event-media-library-page'

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx) {

        // get user lang
        const lang = helper.getLang(ctx);
    
        const fullPopulate = helper.getFullPopulateObject(uid, 4);
        let eventMediaLibraryPages = await strapi.db.query(uid).findMany({where: {locale: lang}, populate: fullPopulate.populate});
        if (!eventMediaLibraryPages) {
          return ctx.response.notFound();
        }
        let eventMediaLibraryPage = eventMediaLibraryPages[0]
    
        let result = {
          header_title: eventMediaLibraryPage[`header_title`],
          header_subtitle: eventMediaLibraryPage[`header_subtitle`],
          header_subtitle_tag: eventMediaLibraryPage[`header_subtitle_tag`],
          header_text: eventMediaLibraryPage[`header_text`],
          header_image: eventMediaLibraryPage.header_image && eventMediaLibraryPage.header_image.url ? eventMediaLibraryPage.header_image.url : null,
          intro_title: eventMediaLibraryPage[`intro_title`],
          intro_subtitle: eventMediaLibraryPage[`intro_subtitle`],
          intro_text: (eventMediaLibraryPage[`intro_text`] !== '<p><br></p>') ? eventMediaLibraryPage[`intro_text`] : null,
          media_libraries: null,
        }
    
        // media libraries
        if (eventMediaLibraryPage.media_libraries && eventMediaLibraryPage.media_libraries.items.length) {
          result.media_libraries = eventMediaLibraryPage.media_libraries.items.map(mediaLibrary => {
            const data = {
              'id': mediaLibrary.id,
              'slug_de': mediaLibrary['slug_de'],
              'slug_en': mediaLibrary['slug_en'],
              'title': mediaLibrary['list_title'],
              'subtitle': mediaLibrary['list_subtitle'],
              'teaser': mediaLibrary['list_teaser'],
              'image': mediaLibrary['list_image'] && mediaLibrary['list_image'].url ? mediaLibrary['list_image'].url : null,
              'detail_button': mediaLibrary['list_detail_button'],
            };
    
            return data;
          });
        }
    
        return result;
      },
}));