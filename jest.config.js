module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|react-native-safe-area-context|react-native-screens|react-native-geolocation-service|react-native-vector-icons|@react-native-async-storage/async-storage)',
  ],
};
