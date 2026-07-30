const CracoLessPlugin = require('craco-less');

module.exports = {
  babel: {
    plugins: [
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-proposal-private-methods",
      "@babel/plugin-proposal-private-property-in-object",
      "@babel/plugin-transform-logical-assignment-operators"
    ]
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { '@primary-color': '#0a488b' },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};