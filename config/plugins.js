module.exports = ({ env }) => ({
  "digitalx-custom-fields": {
    enabled: true,
    resolve: "./src/plugins/digitalx-custom-fields", // path to plugin folder
  },
  "wysiwyg": {
    enabled: true,
    resolve: './src/plugins/wysiwyg'
  },
});
