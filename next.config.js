module.exports = {
  webpack: (config, options) => {
    config.devServer = { https: true };

    return config;
  },
};
