'use strict';

/**
 * topic-of-the-week service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::topic-of-the-week.topic-of-the-week');