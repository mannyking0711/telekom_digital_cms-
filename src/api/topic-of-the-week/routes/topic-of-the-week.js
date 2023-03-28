'use strict';

/**
 * topic-of-the-week router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::topic-of-the-week.topic-of-the-week');