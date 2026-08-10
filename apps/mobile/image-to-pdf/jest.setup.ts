jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("react-native-pdf-from-image", () => ({
  createPdf: jest.fn(),
}));

jest.mock("expo-router", () => {
  const React = require("react");
  return {
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (callback: () => void | (() => void)) => {
      React.useEffect(() => callback(), [callback]);
    },
  };
});

jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(async (uri: string) => ({
    uri,
    width: 1000,
    height: 1000,
  })),
  SaveFormat: { JPEG: "jpeg", PNG: "png" },
}));

jest.mock("expo-file-system", () => ({
  documentDirectory: "file:///mock-documents/",
  cacheDirectory: "file:///mock-cache/",
  getInfoAsync: jest.fn(async () => ({ exists: true, size: 1024 })),
  makeDirectoryAsync: jest.fn(async () => undefined),
  copyAsync: jest.fn(async () => undefined),
  deleteAsync: jest.fn(async () => undefined),
  readDirectoryAsync: jest.fn(async () => []),
}));

jest.mock("expo-intent-launcher", () => ({
  startActivityAsync: jest.fn(async () => undefined),
}));

jest.mock("expo-image-picker", () => ({
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
  launchCameraAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
}));

jest.mock("expo-constants", () => ({
  expoConfig: { android: { package: "app.autoapp.imagetopdf" } },
}));
