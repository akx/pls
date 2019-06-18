module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  'env': {
    'browser': true,
  },
  'rules': {
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/camelcase': 'off',
    'max-len': 'off',
    'react/jsx-filename-extension': 'off',
    'react/prop-types': 'off',
    'jsx-a11y/label-has-for': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
  },
  settings:  {
    react:  {
      version:  'detect',
    },
  },
};
