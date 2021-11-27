/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const { startDevServer } = require("@cypress/webpack-dev-server");
const webpackConfig = require("@vue/cli-service/webpack.config.js");
const admin = require("firebase-admin");
const cypressFirebasePlugin = require("cypress-firebase").plugin;

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const extendedConfig = cypressFirebasePlugin(on, config, admin);

  on("dev-server:start", (options) =>
    startDevServer({
      options,
      webpackConfig,
    })
  );

  require("@cypress/code-coverage/task")(on, extendedConfig);

  return extendedConfig;
};
