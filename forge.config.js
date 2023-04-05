const {readEnvFile} = require('./util/index.common');
const {
  BITBUCKET_USERNAME, BITBUCKET_APP_PASSWORD,
  GITHUB_AUTHTOKEN,
} = readEnvFile('auth.env');

let publishers = [
  {
    name: '@electron-forge/publisher-github',
    config: {
      repository: {
        owner: 'VacantThinker',
        name: 'send-file-to-pc',
      },
      prerelease: true,
      authToken: GITHUB_AUTHTOKEN,
    },
  },
];

module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './public/index.html',
              js: './public/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },
          ],
        },
      },
    },
  ],
  publishers: publishers,
};
