const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Node.js polyfills 설정
config.resolver.alias = {
  ...config.resolver.alias,
  // buffer polyfill 설정
  buffer: require.resolve('buffer'),
};

// Node.js 모듈을 React Native 환경에서 사용할 수 있도록 polyfill 설정
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config; 