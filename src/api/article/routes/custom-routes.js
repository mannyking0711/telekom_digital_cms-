module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/articles/:group/:id',
        handler: 'article.findOne',
      }
    ]
  }