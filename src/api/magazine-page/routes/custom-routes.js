module.exports = {
  routes: [
    {
      "method": "GET",
      "path": "/magazine-pages",
      "handler": "magazine-page.find",
    },
    {
      "method": "GET",
      "path": "/magazine-pages/:type",
      "handler": "magazine-page.findByType",
    }
  ],
};
