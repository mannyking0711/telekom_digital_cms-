const axios = require('axios');

module.exports = async (period) => {
  await strapi.config.functions.matomo('article', period);
  await strapi.config.functions.matomo('video', period);
  await strapi.config.functions.matomo('podcast', period);
};
