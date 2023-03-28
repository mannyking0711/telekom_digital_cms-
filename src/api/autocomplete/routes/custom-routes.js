module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/autocomplete/search',
        handler: 'autocomplete.autocomplete',
      },
      {
        method: 'GET',
        path: '/autocomplete/full_search',
        handler: 'autocomplete.search',
      },

      {
        method: 'GET',
        path: '/autocomplete/health',
        handler: 'autocomplete.getElasticHealth'
      },
      {
        method: 'GET',
        path: '/autocomplete/cron',
        handler: 'autocomplete.cronTest'
      },
      // {
      //   method: 'GET',
      //   path: '/autocomplete/seed',
      //   handler: 'autocomplete.seed'
      // },
      // {
      //   method: 'GET',
      //   path: '/autocomplete/migrate',
      //   handler: 'autocomplete.migrate'
      // }
    ]
  }
