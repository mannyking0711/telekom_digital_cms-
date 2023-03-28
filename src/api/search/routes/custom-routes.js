module.exports = {
  routes: [
    {
      "method": "GET",
      "path": "/search/query",
      "handler": "search.find",

    },
    {
      "method": "GET",
      "path": "/search/refresh",
      "handler": "search.refresh",

    }
  ]
}