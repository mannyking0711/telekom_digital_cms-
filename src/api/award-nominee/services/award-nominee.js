'use strict';

/**
 * award-nominee service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::award-nominee.award-nominee');