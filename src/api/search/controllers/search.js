'use strict';

/**
 * search controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const uid = 'api::search.search'
const Fuse = require("fuse.js");
const helper = require("../../helper");

module.exports = createCoreController(uid, ({strapi}) => ({
    async refresh(ctx) {

        // get user locale
        var lang = helper.getLang(ctx);
    
        // get index options
        let options;
        let entry = await strapi.db.query(uid).findOne({
            select: ['options'],
            where: {locale: lang}
        })

        if ( !entry ) {
            return ctx.response.badData('Invalid search options');
        }
        options = JSON.parse(entry['options']);
    
        // create empty index
        const searchIndex = Fuse.createIndex(options.keys, {});
        let records = [];
    
        ////////////////////////////////////////////////////////////////////////////////////
        // fetch articles
        const articles = await strapi.controller("api::article.article").find(ctx);
    
        for (var i = 0; i < articles.length; i++) {
          const articleShort = articles[i];
          const slug = articleShort['slug_' + lang];
          const group = articleShort.articles_group['slug_' + lang];
          const author = articleShort.author?.fullname;
    
          let articleCtx = {...ctx}
          articleCtx.params = {
            id: slug,
            group: group,
          };
    
          // fetch article details
          const article = await strapi.controller("api::article.article").findOne(articleCtx);
    
          // content
          let content = '';
          if (article.topline) {
            content = content + article.topline + "\n";
          }
          if (article.introtext) {
            content = content + article.introtext + "\n";
          }
          article.content.forEach(_content => {
            if (_content.__component === 'article.article-text') {
              content = content + _content.content + "\n";
            }
          })
    
          // add to records and index
          const data = {
            type: 'article',
            id: article.id,
            title: article.title,
            description: article.meta_description,
            content,
            tags: article.tags,
            author,
            group,
            slug,
            premium: article.premium,
          };
          searchIndex.add(data);
          records.push(data);
        }
    
        ////////////////////////////////////////////////////////////////////////////////////
        // fetch videos
        const videos = await strapi.controller("api::video.video").find(ctx);
    
        for (var i = 0; i < videos.length; i++) {
          const videoShort = videos[i];
          const slug = videoShort['slug_' + lang];
          const group = videoShort.videos_group['slug_' + lang];
          const author = videoShort.author.fullname;
    
          let videoCtx = {...ctx}
          videoCtx.params = {
            id: slug,
            group: group,
          };
    
          // fetch video details
          const video = await strapi.controller("api::video.video").findOne(videoCtx);
    
          // content
          let content = '';
          if (video.appearances) {
            video.appearances.forEach(appearance => {
              content = content + appearance.name + "\n";
            })
          }
    
          // add to records and index
          const data = {
            type: 'video',
            id: video.id,
            title: video.title,
            description: video.meta_description,
            content,
            tags: video.tags,
            author,
            group,
            slug,
            premium: video.premium,
          };
          searchIndex.add(data);
          records.push(data);
        }
    
        ////////////////////////////////////////////////////////////////////////////////////
        // fetch podcasts
        const podcasts = await strapi.controller("api::podcast.podcast").find(ctx);
    
        for (var i = 0; i < podcasts.length; i++) {
          const podcastShort = podcasts[i];
          const slug = podcastShort['slug_' + lang];
          const group = podcastShort.podcast_group['slug_' + lang];
          const author = '';
    
          let podcastCtx = {...ctx}
          podcastCtx.params = {
            id: slug,
            group: group,
          };
    
          // fetch podcast details
          const podcast = await strapi.controller("api::podcast.podcast").findOne(podcastCtx);
    
          // content
          let content = '';
          if (podcast.shownotes) {
            content = content + podcast.shownotes + "\n";
          }
          if (podcast.appearances) {
            podcast.appearances.forEach(appearance => {
              content = content + appearance.name + "\n";
            })
          }
    
          // add to records and index
          const data = {
            type: 'podcast',
            id: podcast.id,
            title: podcast.title,
            description: podcast.meta_description,
            content,
            tags: podcast.tags,
            author,
            group,
            slug,
            premium: podcast.premium,
          };
          searchIndex.add(data);
          records.push(data);
        }
    
        ////////////////////////////////////////////////////////////////////////////////////
        // fetch speakers
        const speakers = await strapi.controller("api::speaker.speaker").find(ctx);
    
        for (var i = 0; i < speakers.length; i++) {
          const speakerShort = speakers[i];
          const slug = speakerShort['slug_' + lang];
          const group = '';
          const author = '';
    
          ctx.params = {
            id: slug,
          };

          let speakerCtx = {...ctx}
          speakerCtx.params = {
            id: slug,
          };
    
          // fetch speaker details
          const speaker = await strapi.controller("api::speaker.speaker").findOne(speakerCtx);
    
          // content
          let content = '';
          if (speaker.description) {
            content = content + speaker.description + "\n";
          }
          if (speaker.sessions) {
            speaker.sessions.forEach(session => {
              content = content + session.title + "\n";
            })
          }
    
          // add to records and index
          const data = {
            type: 'speaker',
            id: speaker.id,
            title: speaker.fullname,
            description: speaker.company,
            content,
            tags: speaker.tags,
            author,
            group,
            slug,
          };
          searchIndex.add(data);
          records.push(data);
        }
    
        ////////////////////////////////////////////////////////////////////////////////////
        // fetch partners
        const partners = await strapi.controller("api::partner.partner").find(ctx);
    
        for (var i = 0; i < partners.length; i++) {
          const partnerShort = partners[i];
          const slug = partnerShort['slug_' + lang];
          const group = '';
          const author = '';

          let partnerCtx = {...ctx}
          partnerCtx.params = {
            id: slug,
          };
    
          // fetch partner details
          const partner = await strapi.controller("api::partner.partner").findOne(partnerCtx);
    
          // content
          let content = partner['content'];
    
          // add to records and index
          const data = {
            type: 'partner',
            id: partner.id,
            title: partner.name,
            description: partner['description'] ? partner['description'] : '',
            content,
            tags: [],
            author,
            group,
            slug,
          };
          searchIndex.add(data);
          records.push(data);
        }
    
        ////////////////////////////////////////////////////////////////////////////////////
        // fetch digi-index-sectors
        if (lang == 'de') {
          const digiIndexSectors = await strapi.controller("api::digi-index-sector.digi-index-sector").find(ctx);
    
          for (var i = 0; i < digiIndexSectors.length; i++) {
            const digiIndexSectorShort = digiIndexSectors[i];
            const slug = digiIndexSectorShort['slug'];
            const group = '';
            const author = '';
    
            let digiIndexSectorCtx = {...ctx}
            digiIndexSectorCtx.params = {
              id: slug,
            };
    
            // fetch digi-index-sector details
            const digiIndexSector = await await strapi.controller("api::digi-index-sector.digi-index-sector").findOne(digiIndexSectorCtx);
    
            // content
            let content = digiIndexSector.page_subtitle ? (digiIndexSector.page_subtitle + "\n") : '';
            digiIndexSector.content.forEach(_content => {
              if (_content.__component === 'article.article-text-image') {
                content = content + _content.content + "\n";
              }
            })
    
            // add to records and index
            const data = {
              type: 'digi-index',
              id: digiIndexSector.id,
              title: digiIndexSector.page_title,
              description: digiIndexSector.page_intro ? digiIndexSector.page_intro : '',
              content,
              tags: [],
              author,
              group,
              slug,
            };
            searchIndex.add(data);
            records.push(data);
          }
        }
    
        // save data
        const data = {};
        data['index'] = JSON.stringify(searchIndex.toJSON());
        data['data'] = JSON.stringify(records);
        const result = await strapi.db.query(uid).updateMany({
            where: {locale: lang},
            data
        })
    
        // Only for debugging:
        // return records;
    
        return {};
      },
    
      async find(ctx) {
        // get user locale
        var lang = helper.getLang(ctx);
    
        // get query parameter ?q=foo
        const {q} = ctx.request.query;
    
        // Debug
        // console.log("lang", lang);
        // console.log("q", q);
    
        if (!lang || !q) return [];
    
        let entry = await strapi.db.query(uid).findOne({where: {locale: lang}})
    
        let result = [];
        if (entry) {
          const index = JSON.parse(entry['index']);
          const data = JSON.parse(entry['data']);
          const options = JSON.parse(entry['options']);
          const fuseIndex = Fuse.parseIndex(index);
          const fuse = new Fuse(data, options, fuseIndex);
          const resultset = fuse.search(q);
          resultset.forEach(data => {
    
            result.push({
              type: data.item.type,
              id: data.item.id,
              title: data.item.title,
              description: data.item.description,
              group: data.item.group,
              slug: data.item.slug,
              score: data.score,
              matches: data.matches,
            });
          })
        }
    
        return result;
      },
}));