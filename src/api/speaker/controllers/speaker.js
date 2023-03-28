'use strict';

/**
 * speaker controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const uid = 'api::speaker.speaker'
var dateFormat = require('dateformat');
var helper = require('../../helper');

module.exports = createCoreController(uid, ({strapi}) => ({
      /////////////////////////////////
  // FIND / LIST
  /////////////////////////////////

  async find(ctx) {

    // get user locale
    const lang = helper.getLang(ctx);

    // config database query
    const fullPopulate = helper.getFullPopulateObject(uid, 4);
    const columns = ['id', 'name', 'surname', 'company', 'subline', 'slug_de', 'slug_en'];
    const relations = {'img_list': true, 'links': true, 'speaker_megatrends': fullPopulate.populate.speaker_megatrends};
    const where = {status: 'published', locale: lang};

    // get data from database
    const result = await strapi.db.query(uid).findMany({
      select: columns,
      where,
      populate: relations
    })

    // modify data after database query
    return result.map(entity => {

      // modify img_list property to send url only
      if (entity.img_list) {
        entity.img_list = entity.img_list.url;
      }

      return entity;
    });
  },


  /////////////////////////////////
  // DETAIL
  /////////////////////////////////

  async findOne(ctx) {

    // validate user input
    const {id} = ctx.params;

    // get user locale
    var lang = helper.getLang(ctx);

    // get query parameter preview_secret (preview draft records)
    const isPreviewDraft = ctx.request.query.preview_secret === strapi.config.get('frontend.preview_secret');

    // config database query
    const fullPopulate = helper.getFullPopulateObject(uid, 4);
    var columns = [
      'id', 'name', 'surname', 'fullname', 'company', 'subline',
      'speaker_headline', 'description',
      'slug_de', 'slug_en', 'meta_title', 'meta_description',
      'twitter', 'website', 'facebook', 'linkedin', 'instagram', 'youtube', 'xing',
      `megatrends_headline`,
      `megatrends_text`,
      `megatrends_subheadline`,
      `agenda_headline`,
      `agenda_text`,
    ];
    var where = {locale: lang};
    where['slug_' + lang] = id;
    if (isPreviewDraft === false) {
      where['status'] = 'published'
    }
    var relations = {'img_detail': true, 'img_header': true, 'links': true, speaker_megatrends: fullPopulate.populate.speaker_megatrends};

    // get data from database
    var result = await strapi.db.query(uid).findOne({
      select: columns,
      where,
      populate: relations
    })

    if ( !result ) {
      return ctx.response.notFound();
    }

    // prepare assets
    if (result.img_detail && result.img_detail.url) {
      result.img_detail = result.img_detail.url;
    }

    if (result.img_header && result.img_header.url) {
      result.img_header = result.img_header.url;
    }

    // Megatrends
    result.megatrends = createMegatrends(result.speaker_megatrends ? result.speaker_megatrends : null, lang);
    delete result.speaker_megatrends;

    // get some data from event-speaker-page
    let speakerPage = await strapi.db.query('api::event-speaker-page.event-speaker-page').findOne({
      where : {locale: lang}
    });

    // Megatrends labels
    result.megatrends_headline = result.megatrends_headline ? result.megatrends_headline : speakerPage['megatrends_headline'];
    result.megatrends_text = result.megatrends_text && (result.megatrends_text !== '<p><br></p>') ? result.megatrends_text : speakerPage['megatrends_text'];
    result.megatrends_subheadline = result.megatrends_subheadline ? result.megatrends_subheadline : speakerPage['megatrends_subheadline'];

    // Agenda labels
    result.agenda_headline = result.agenda_headline ? result.agenda_headline : speakerPage['agenda_headline'];
    result.agenda_text = result.agenda_text ? result.agenda_text : speakerPage['agenda_text'];

    // load all sessions of this speaker
    if (result && result.id) {
      result.sessions = await findSessions(result.id, lang);

      // format output of sessions
      result.sessions.map(session => {
        session.day_iso = dateFormat(session.day_date, 'yyyy-mm-dd');
        session.day_date = dateFormat(session.day_date, 'dd.mm.yyyy');
        session.from = session.from.split(':');
        session.from = `${session.from[0]}:${session.from[1]}`;
        session.to = session.to.split(':');
        session.to = `${session.to[0]}:${session.to[1]}`;
      });
    }

    return result;
  },
}));

/*///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	HELPER
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */

async function findSessions(speakerId, language) {
    const knex = strapi.db.connection;
  
    let query = knex('components_agenda_sessions_participants_links')
      .join('components_agenda_sessions', 'components_agenda_sessions_participants_links.sessions_id', 'components_agenda_sessions.id') 
      .join('components_agenda_subjects_components', function () {
        this
          .on('components_agenda_sessions.id', '=', 'components_agenda_subjects_components.component_id')
          .andOn('components_agenda_subjects_components.component_type', '=', knex.raw('?', ['agenda.sessions'])) 
      })
      .join('components_agenda_subjects', 'components_agenda_subjects_components.entity_id', 'components_agenda_subjects.id')
      .join('components_agenda_days_components', function () {
        this
          .on('components_agenda_subjects.id', '=', 'components_agenda_days_components.component_id')
          .andOn('components_agenda_days_components.component_type', '=', knex.raw('?', ['agenda.subjects']))
      })
      .join('components_agenda_days', 'components_agenda_days_components.entity_id', 'components_agenda_days.id')
      .join('event_agendas_components', function () {
        this
          .on('components_agenda_days.id', '=', 'event_agendas_components.component_id')
          .andOn('event_agendas_components.component_type', '=', knex.raw('?', ['agenda.days']))
      })
      .join('event_agendas', 'event_agendas_components.entity_id', 'event_agendas.id')
      .join('event_agendas_event_links', 'event_agendas.id', 'event_agendas_event_links.event_agenda_id')
      .join('events', 'events.id', 'event_agendas_event_links.event_id')
      .where('speaker_id', speakerId)
      .whereNotNull('event_agendas.published_at')
      .whereNotNull('events.id')
      .andWhere('events.status', 'published')
      .distinct()
      .select({
        'id': 'components_agenda_sessions.id',
        'from': 'from',
        'to': 'to',
        'title': `components_agenda_sessions.title`,
        'description': `components_agenda_sessions.description`,
        'event_id': 'events.id',
        'slug_de': `events.slug_de`,
        'slug_en': `events.slug_en`,
        'event_title': `events.title`,
        'subject_title': `components_agenda_subjects.title`,
        'subject_subtitle': `components_agenda_subjects.subtitle`,
        'day_date': 'components_agenda_days.day',
        'day_title': `components_agenda_days.title`,
        'day_subtitle': `components_agenda_days.subtitle`
      })
      .orderBy([
        {column: 'day_date'},
        {column: 'from'}
      ]);
    // console.log(query.toSQL().toNative());
  
    return query;
  }
  
  function createMegatrends(speakerMegatrends, lang) {
    let result = null;
    if (speakerMegatrends && speakerMegatrends.megatrends && speakerMegatrends.megatrends.length > 0) {
      result = [];
      speakerMegatrends.megatrends.forEach(item => {
        result.push({
          id: item.id,
          name: item['name'],
          icon: item.icon && item.icon.url ? item.icon.url : null,
        });
      });
      result.sort((a, b) => (a.name > b.name) ? 1 : -1)
    }
  
    return result;
  }