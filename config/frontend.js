// Make .env vars available via strapi.config.get('frontend.preview_secret')
module.exports = ({env}) => ({
  url: env('FRONTEND_URL'),
  preview_secret: env('FRONTEND_PREVIEW_SECRET')
});
