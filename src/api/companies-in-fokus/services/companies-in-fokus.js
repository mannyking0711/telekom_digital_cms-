'use strict';

/**
 * companies-in-fokus service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::companies-in-fokus.companies-in-fokus');