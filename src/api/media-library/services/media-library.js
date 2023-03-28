'use strict';

/**
 * media-library service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::media-library.media-library');