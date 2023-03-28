'use strict';

/**
 * event-agenda service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::event-agenda.event-agenda');