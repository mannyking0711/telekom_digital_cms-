module.exports = {
  routes: [
    {
      method: "POST",
      path: "/bookmarks/add",
      handler: "bookmark.create",
    },
    {
      method: "POST",
      path: "/bookmarks/delete",
      handler: "bookmark.delete",
    },
  ],
};
