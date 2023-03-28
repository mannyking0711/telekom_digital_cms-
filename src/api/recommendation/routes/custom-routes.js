module.exports = {
  routes: [
    {
      method: "GET",
      path: "/recommendations",
      handler: "recommendation.find",
    },
  ],
};
