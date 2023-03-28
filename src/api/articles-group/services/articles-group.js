'use strict';

/**
 * articles-group service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::articles-group.articles-group');