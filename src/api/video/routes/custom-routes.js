module.exports = {
  routes: [
    {
      method: "GET",
      path: "/videos/:group/:id",
      handler: "video.findOne",
    },
  ],
};
