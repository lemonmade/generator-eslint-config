import '../../helper';

import path from 'path';
import helpers from 'yeoman-test';

describe('generator:eslint', () => {
  const generatorIndex = path.join(__dirname, '../../../generators/eslint');

  function cleanName(plugin) { return plugin.replace(/(eslint|plugin|config)-/g, ''); }

  describe('defaults', () => {
    before((done) => {
      helpers
        .run(generatorIndex)
        .on('end', done);
    });

    it('fills out the ESLint file', () => {
      assert.noFileContent('.eslintrc', /"extends"/);
      assert.noFileContent('.eslintrc', /"plugins"/);
      assert.jsonFileContent('.eslintrc', {parser: 'babel-eslint'});
    });

    it('fills out the package.json', () => {
      assert.noFileContent('package.json', /eslint-config-/);
      assert.noFileContent('package.json', /eslint-plugin-/);
      assert.jsonFileContent('package.json', {
        devDependencies: {
          eslint: '*',
          'babel-eslint': '*',
        },
      });
    });
  });

  describe('--extends', () => {
    const packageName = 'custom-extends';
    const extend = `${packageName}/sub-directory`;

    before((done) => {
      helpers
        .run(generatorIndex)
        .withOptions({extends: extend})
        .on('end', done);
    });

    it('fills out the ESLint file', () => {
      assert.jsonFileContent('.eslintrc', {extends: extend});
    });

    it('fills out the package.json', () => {
      assert.jsonFileContent('package.json', {
        devDependencies: {[`eslint-config-${packageName}`]: '*'},
      });
    });
  });

  describe('? extends', () => {
    const packageName = 'custom-extends';
    const extend = `${packageName}/sub-directory`;

    before((done) => {
      helpers
        .run(generatorIndex)
        .withPrompts({extends: extend})
        .on('end', done);
    });

    it('fills out the ESLint file', () => {
      assert.jsonFileContent('.eslintrc', {extends: extend});
    });

    it('fills out the package.json', () => {
      assert.jsonFileContent('package.json', {
        devDependencies: {[`eslint-config-${packageName}`]: '*'},
      });
    });
  });

  describe('--plugins', () => {
    const plugins = ['one', 'plugin-two'];

    before((done) => {
      helpers
        .run(generatorIndex)
        .withOptions({plugins: plugins.join(', ')})
        .on('end', done);
    });

    it('fills out the ESLint file', () => {
      assert.jsonFileContent('.eslintrc', {plugins: plugins.map(cleanName)});
    });

    it('fills out the package.json', () => {
      let expectedDependencies = {};
      plugins.forEach((plugin) => expectedDependencies[`eslint-plugin-${cleanName(plugin)}`] = '*');
      assert.jsonFileContent('package.json', {devDependencies: expectedDependencies});
    });
  });

  describe('? plugins', () => {
    const plugins = ['one', 'plugin-two'];

    before((done) => {
      helpers
        .run(generatorIndex)
        .withPrompts({plugins})
        .on('end', done);
    });

    it('fills out the ESLint file', () => {
      assert.jsonFileContent('.eslintrc', {plugins: plugins.map(cleanName)});
    });

    it('fills out the package.json', () => {
      let expectedDependencies = {};
      plugins.forEach((plugin) => expectedDependencies[`eslint-plugin-${cleanName(plugin)}`] = '*');
      assert.jsonFileContent('package.json', {devDependencies: expectedDependencies});
    });
  });

  describe('--plugins && ? plugins', () => {
    const plugins = ['one', 'plugin-two'];
    const promptPlugins = ['three', 'eslint-plugin-four'];
    const allPlugins = [...plugins, ...promptPlugins];

    before((done) => {
      helpers
        .run(generatorIndex)
        .withOptions({plugins: plugins.join(' ,')})
        .withPrompts({plugins: promptPlugins})
        .on('end', done);
    });

    it('fills out the ESLint file', () => {
      assert.jsonFileContent('.eslintrc', {plugins: allPlugins.map(cleanName)});
    });

    it('fills out the package.json', () => {
      let expectedDependencies = {};
      allPlugins.forEach((plugin) => expectedDependencies[`eslint-plugin-${cleanName(plugin)}`] = '*');
      assert.jsonFileContent('package.json', {devDependencies: expectedDependencies});
    });
  });
});
