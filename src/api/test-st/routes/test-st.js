'use strict';

/**
 * test-st router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::test-st.test-st');
