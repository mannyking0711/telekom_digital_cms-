'use strict';

/**
 * newsletter controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const helper = require("../../helper");
const _ = require("lodash");
var dateFormat = require('dateformat');
const uid = 'api::newsletter.newsletter'

module.exports = createCoreController(uid, ({strapi}) => ({
    async find(ctx) {

        // get user locale
        var lang = helper.getLang(ctx);
    
        // config database query
        var columns = ['id', 'title', 'link'];
        var relations = {};
        relations['download'] = true;
        relations['event'] = {
          select: ['id', `title`]
        };
        const today = dateFormat(Date.now(), 'yyyy-mm-dd');
    
        // get data from database
        var result = await strapi.db.query(uid).findMany({
            select: columns,
            where: {locale: lang,
                title: {
                    $notNull: true,
                    $ne: "",
                  },
                  publishedAt: {
                    $lte: today + "T23:59:59Z",
                  },
                  locale: lang,},
            populate: relations,
            orderBy: {publishedAt: 'DESC'},
            limit: 100
        })
    
        // remove items without neither link nor download
        var toRemove = [];
        result.forEach((item) => {
          if (_.isEmpty(item['link']) && (item['download'].id === undefined)) {
            toRemove.push(item);
          }
        });
        if (toRemove) {
            delete result[toRemove];
        }
    
        // group by event
        result = _.groupBy(result, 'event.id');
    
        // restructure the data
        var newResult = [];
        for (const key in result) {
          newResult.push({
            event: result[key][0]['event'],
            newsletters: result[key].map(item => {
    
              // modify download property
              helper.defaultOutputFormat(item.download);
    
              // remove event
              delete item['event'];
    
              return item;
            })
          });
        }
    
        return newResult;
      },
}));