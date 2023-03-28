'use strict';

module.exports = ({ strapi }) => {
  strapi.customFields.register({
    name: 'tabs',
    plugin: 'digitalx-custom-fields',
    type: 'string',
  });
  strapi.customFields.register({
    name: 'accordions',
    plugin: 'digitalx-custom-fields',
    type: 'string',
  });
  strapi.customFields.register({
    name: 'divider',
    plugin: 'digitalx-custom-fields',
    type: 'string',
  });
};
