'use strict';

module.exports = ({ strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('digitalx-custom-fields')
      .service('myService')
      .getWelcomeMessage();
  },
});
