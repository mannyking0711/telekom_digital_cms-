module.exports = {
  routes: [
    {
      method: "GET",
      path: "/podcasts/:group/:id",
      handler: "podcast.findOne",
    },
  ],
};
