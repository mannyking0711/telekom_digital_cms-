module.exports = {
  routes: [
    {
      method: "GET",
      path: "/impressions/:type",
      handler: "impression.findByType",
    },
    {
      method: "GET",
      path: "/impressions/podcast-group/:group",
      handler: "impression.findByPodcastGroup",
    },
    {
      method: "GET",
      path: "/impressions/refresh/:period",
      handler: "impression.refresh",
    },
    {
      method: "GET",
      path: "/impressions/findAll/:type",
      handler: "impression.findAll",
    },
  ],
};
