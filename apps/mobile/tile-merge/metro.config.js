const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const adsStubPath = path.resolve(__dirname, "game/ads/googleMobileAds.stub.ts");

// Real AdMob on EAS cloud builds only. Stub in Expo Go / local Metro dev.
const useAdsStub = process.env.EAS_BUILD !== "true";

if (useAdsStub) {
  const defaultResolveRequest = config.resolver.resolveRequest;
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (moduleName === "react-native-google-mobile-ads") {
      return {
        filePath: adsStubPath,
        type: "sourceFile",
      };
    }
    if (defaultResolveRequest) {
      return defaultResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;
