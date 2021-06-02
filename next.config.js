module.exports = {
  webpack: (config, options) => {
    config.devServer = { https: true };

    return config;
  },
  basePath: "/web-camera-test",
};
