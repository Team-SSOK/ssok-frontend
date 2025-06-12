// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'import/no-unresolved': 'off',
    'prettier/prettier': 'warn',
    'max-depth': ['warn', 3],           
    'max-nested-callbacks': ['warn', 3],
    'max-lines-per-function': ['warn', {'max': 50, "skipBlankLines": true, "skipComments": true}],
    "max-lines": ['warn', {"max": 300, "skipBlankLines": true, "skipComments": true}],
    "no-unused-vars": ["warn", {"vars": "all", "args": "after-used", "ignoreRestSiblings": true}],
    "no-nested-ternary": "warn",
    
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
};
