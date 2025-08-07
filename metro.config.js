// Metro configuration for Expo SDK 53
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Opt out of package.json "exports" resolution to avoid pulling Node-only entry points
// in some libraries when bundling for React Native.
config.resolver.unstable_enablePackageExports = false;

// Stub node-only modules that may be referenced indirectly (e.g., ws -> stream)
config.resolver.extraNodeModules = {
  ws: path.resolve(__dirname, 'shims/empty.js'),
  stream: path.resolve(__dirname, 'shims/empty.js'),
};

module.exports = config;


