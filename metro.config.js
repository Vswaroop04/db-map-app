const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  'react-native-css-interop': path.resolve(
    __dirname,
    'node_modules/nativewind/node_modules/react-native-css-interop'
  ),
};

const nativewindModules = path.resolve(__dirname, 'node_modules/nativewind/node_modules');

config.resolver.blockList = [
  // force nativewind to use root react and react-native instead of its bundled copies
  new RegExp(`^${esc(path.join(nativewindModules, 'react-native'))}(/.*)?$`),
  new RegExp(`^${esc(path.join(nativewindModules, 'react'))}(/.*)?$`),
  // exclude standalone script folders so NativeWind doesn't look for tailwind.config there
  new RegExp(`^${esc(path.resolve(__dirname, 'seed'))}(/.*)?$`),
  new RegExp(`^${esc(path.resolve(__dirname, 'seed-script'))}(/.*)?$`),
  new RegExp(`^${esc(path.resolve(__dirname, 'api-tests'))}(/.*)?$`),
];

module.exports = withNativeWind(config, { input: './global.css' });
