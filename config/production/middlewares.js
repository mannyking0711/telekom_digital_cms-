module.exports = [
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:1337',
        'http://localhost:8080',
        'http://localhost:8000',
        'http://localhost',
        'http://digitalx-web.test',
        'http://digital-x-web.local',
        'http://tk-digital-x-web.local',
        'https://tk-digital-x-web.local',
        'http://tk-digital-x-cms.local',
        'https://tk-digital-x-cms.local',
        'http://tk-digital-x-cms.local:1337',
        'https://tk-digital-x-cms.local:1337',
        'http://preview-cms-develop.digital-x.eu',
        'http://preview-cms-production.digital-x.eu',
        'http://preview-web-develop.digital-x.eu',
        'http://preview-web-production.digital-x.eu',
        'https://preview-web-production.digital-x.eu',
        'http://staging-cms.digital-x.eu',
        'https://staging-cms.digital-x.eu',
        'http://staging-web.digital-x.eu',
        'https://staging-web.digital-x.eu',
        'http://www.digital-x.eu',
        'https://www.digital-x.eu',
        'https://cms.digital-x.wsdev.io',
        'https://cms-legacy.digital-x.wsdev.io',
        'https://cms-upgrade.digital-x.wsdev.io',
        'https://digital-x.wsdev.io',

      ],
      headers: [
        'content-type',
        'X-Requested-With',
        'X-CSRF-TOKEN'
      ]
    }
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formidable: {
        maxFileSize: 400 * 1024 * 1024
      }
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
