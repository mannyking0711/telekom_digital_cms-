'use strict';

/**
 * migrate-option controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::migrate-option.migrate-option');
