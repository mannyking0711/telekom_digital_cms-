module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/authors/details/:slug',
        handler: 'author.findOneBySlug',
      }
    ]
  }