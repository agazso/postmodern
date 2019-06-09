const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  ...tsjPreset,
  preset: 'react-native',
  transform: {
    ...tsjPreset.transform,
    '\\.js$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
  },
  "transformIgnorePatterns": [
    "node_modules/(?!react-native|react-navigation)/"
  ],
  "testMatch": ["<rootDir>/test/**/*.ts*"],
  "testPathIgnorePatterns": [
    "\\.snap$",
    "<rootDir>/node_modules/",
    "<rootDir>/lib/",
    "<rootDir>/build/",
    "<rootDir>/e2e/"
  ],
  modulePathIgnorePatterns: ["<rootDir>/src/.*/__mocks__"],
  globals: {
    'ts-jest': {
      babelConfig: true,
    }
  },
  // This is the only part which you can keep
  // from the above linked tutorial's config:
  cacheDirectory: '.jest/cache',
};
