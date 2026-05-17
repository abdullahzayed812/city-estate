module.exports = {
  project: {
    android: { sourceDir: './android' },
    ios: { sourceDir: './ios' },
  },
  assets: ['./assets'],
  commands: require('@bam.tech/react-native-make/dist/rn-plugin.config').rnPluginConfig.commands,
};
