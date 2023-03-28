module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/events/:eventId/agenda',
        handler: 'event-agenda.findOne',
      }
    ]
  }