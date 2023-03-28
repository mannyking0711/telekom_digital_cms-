module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'res.cloudinary.com', // cloudinary images
            'lh3.googleusercontent.com', // google avatars
            'platform-lookaside.fbsbx.com', // facebook avatars
            'dl.airtable.com', // strapi marketplace
            `https://telekom-digitalx-content-develop.s3.eu-central-1.amazonaws.com`
          ],
          'media-src': ["'self'", 'data:', 'blob:', `https://telekom-digitalx-content-develop.s3.eu-central-1.amazonaws.com`],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::poweredBy',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      origin: ['*']
      // headers: [
      //   'content-type',
      //   'X-Requested-With',
      //   'X-CSRF-TOKEN'
      // ]
    }
  },
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
