module.exports = {
  routes: [
    {
      method: "POST",
      path: "/content/migrate-data",
      handler: "content.migrateDataFromV3",
    },
    {
      method: "GET",
      path: "/content/delete-data",
      handler: "content.deleteAllData",
    },
    {
      method: "POST",
      path: "/content/test-func",
      handler: "content.testFunc",
    },
  ],
};
