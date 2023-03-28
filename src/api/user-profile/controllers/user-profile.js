'use strict';

/**
 * user-profile controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const uid = 'api::user-profile.user-profile'
const axios = require('axios');
const https = require('https');
const helper = require("../../helper");

module.exports = createCoreController(uid, ({strapi}) => ({
    async findOneByUser(ctx) {

        let lang = helper.getLang(ctx);

        const user_id = ctx.params.user;
        const access_token = ctx.request.body.access_token;
    
        if (!user_id || !access_token) {
          return ctx.response.badData('Invalid data');
        }
    
        //get userProfile from aditus
    
        let instance = axios.create({
          headers: {
            post: {
              'Authorization': `Bearer ${access_token}`,
            }
          },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false
          })
        })
    
    
        const aditusData = await instance.post('https://secure.digital-x.eu/DX_Identity/connect/userinfo'
        ).then(res => {
          return res.data
        }).catch(error => {
          console.log(error)
        })
    
        if (user_id !== aditusData.sub) {
          return ctx.response.badData('Invalid data');
        }
    
        // config database query
        var columns = ['id', 'user_id'];
    
        var where = {user_id, locale: lang};
        var relations = ['tags', 'bookmarks'];
    
        // get data from database
        let userProfile = await strapi.db.query(uid).findOne({
            select: columns,
            where,
            populate: relations
        })
    
        // Create userProfile if not exists
        // Here we have to create ML record , or make the user-profile one lang entry
        if (!userProfile) {
            userProfile = await strapi.service(uid).create({user_id, locale: 'de'});
            await strapi.service(uid).create({user_id, locale: 'en'});
        }
    
        let tags = [];
        if (aditusData.interest) {
          for (const tag of aditusData.interest) {
            let result = await strapi.db.query('api::tag.tag').findOne({where: {aditus_id: tag, locale: lang}});
            if (result !== null) {
              tags.push(result);
            }
          }
        }
    
        userProfile.tags = tags;
    
        // Build grouped bookmarks
        let bookmarks = {
          'article': [],
          'video': [],
          'podcast': [],
        }
        userProfile.bookmarks.forEach(bookmark => {
          bookmarks[bookmark.item_type].push(parseInt(bookmark.item_id));
        });
        userProfile.bookmarks = bookmarks;
    
        return userProfile;
    
      },
}));