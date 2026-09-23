// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// expo-sqlite corre en la web usando SQLite compilado a WebAssembly,
// así que Metro necesita saber servir archivos .wasm como assets.
config.resolver.assetExts.push('wasm');

// El WebAssembly de SQLite usa SharedArrayBuffer, que los navegadores
// solo permiten si la página se sirve con estas cabeceras de aislamiento.
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return middleware(req, res, next);
  };
};

module.exports = config;
