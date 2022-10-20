module.exports = {
  bracketSpacing: true,
  bracketSameLine: true,
  singleQuote: true,
  trailingComma: 'all',
  // A person has his limits, and 80 is not it.
  printWidth: 100,
  overrides: [
    {
      files: '*.js',
      options: {
        parser: 'babel',
      },
    },
  ],
};
