module.exports = {
  routes: [
    {
      method: "POST",
      path: "/user-profiles/user/:user",
      handler: "user-profile.findOneByUser",
    },
  ],
};
