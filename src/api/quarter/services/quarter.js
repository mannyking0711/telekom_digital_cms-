'use strict';

/**
 * quarter service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::quarter.quarter');