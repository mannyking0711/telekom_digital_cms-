'use strict';

/**
 * test-st service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::test-st.test-st');
