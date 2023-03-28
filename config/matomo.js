module.exports = ({env}) => ({
  url: env('MATOMO_URL'),
  token: env('MATOMO_TOKEN')
});
