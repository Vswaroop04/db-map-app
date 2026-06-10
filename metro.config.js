const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  'react-native-css-interop': path.resolve(
    __dirname,
    'node_modules/nativewind/node_modules/react-native-css-interop'
  ),
};

const nativewindModules = path.resolve(__dirname, 'node_modules/nativewind/node_modules');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

config.resolver.blockList = [
  new RegExp(`^${esc(path.join(nativewindModules, 'react-native'))}(/.*)?$`),
  new RegExp(`^${esc(path.join(nativewindModules, 'react'))}(/.*)?$`),
  new RegExp(`^${esc(path.resolve(__dirname, 'seed'))}(/.*)?$`),
  new RegExp(`^${esc(path.resolve(__dirname, 'seed-script'))}(/.*)?$`),
  new RegExp(`^${esc(path.resolve(__dirname, 'api-tests'))}(/.*)?$`),
];

module.exports = withNativeWind(config, { input: './global.css' });