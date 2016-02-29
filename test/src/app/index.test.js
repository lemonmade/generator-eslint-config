import '../../helper';

import fs from 'fs';
import path from 'path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

import ownPackage from '../../../package.json';

describe('generator:app', () => {
  let generator;
  const generatorIndex = path.join(__dirname, '../../../src/app');

  function cleanName(plugin) {
    return plugin.replace(/(eslint|plugin|config)-/g, '');
  }

  function spyOnGenerator(gen) {
    generator = gen;
    sinon.spy(gen, 'npmInstall');
  }

  afterEach(() => {
    if (generator && generator.npmInstall.restore) {
      generator.npmInstall.restore();
    }

    generator = null;
  });

  describe('defaults', () => {
    beforeEach((done) => {
      helpers
        .run(generatorIndex)
        .on('ready', spyOnGenerator)
        .on('end', done);
    });

    it('uses reasonable defaults for the eslintrc', () => {
      assert.jsonFileContent('.eslintrc', {
        extends: 'eslint:recommended',
        parser: 'babel-eslint',
        plugins: [],
        env: {es6: true},
        rules: {},
      });
    });

    it('uses reasonable defaults for the test eslintignore', () => {
      assert.fileContent('.eslintignore', /coverage\//);
      assert.fileContent('.eslintignore', /node_modules\//);
    });

    it('sorts the eslintrc file', () => {
      const configOrder = [
        'extends',
        'parser',
        'plugins',
        'env',
        'globals',
        'rules',
      ];

      let eslintConfig = JSON.parse(fs.readFileSync('.eslintrc').toString());
      let lastIndex = -1;

      Object.keys(eslintConfig).forEach((key) => {
        let indexOfKey = configOrder.indexOf(key);
        expect(indexOfKey).to.be.greaterThan(lastIndex);
        lastIndex = indexOfKey;
      });
    });

    it('installs the default dependencies', () => {
      let args = generator.npmInstall.lastCall.args;

      expect(args[1]).to.deep.equal({saveDev: true});
      expect(args[0]).to.include(
        'eslint',
        'babel-eslint',
      );
    });

    it('adds a linting script', () => {
      assert.jsonFileContent('package.json', {
        scripts: {lint: ownPackage.scripts.lint},
      });
    });
  });

  describe('--envs', () => {
    const envs = ['es6', 'browser', 'jquery'];
    const testFramework = 'mocha';

    let expectedEnv = {};
    envs.forEach((env) => expectedEnv[env] = true);

    context('when provided by options', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withOptions({envs: envs.join(', '), testFramework})
          .on('end', done);
      });

      it('sets the correct env', () => {
        assert.jsonFileContent('.eslintrc', {
          env: expectedEnv,
        });
      });
    });

    context('when provided by prompts', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withPrompts({env: envs, testFramework})
          .on('end', done);
      });

      it('sets the correct env', () => {
        assert.jsonFileContent('.eslintrc', {
          env: expectedEnv,
        });
      });
    });
  });

  describe('--extends', () => {
    const extendConfig = 'shopify';

    context('when an eslint config is provided', () => {
      const eslintConfig = 'eslint:recommended';

      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withOptions({extends: eslintConfig})
          .on('ready', spyOnGenerator)
          .on('end', done);
      });

      it('sets the eslintrc extends', () => {
        assert.jsonFileContent('.eslintrc', {extends: eslintConfig});
      });

      it('does not install a config unnecessarily', () => {
        let args = generator.npmInstall.lastCall.args;
        expect(args[0]).not.to.include('eslint-config-eslint');
      });
    });

    context('when provided by options', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withOptions({extends: extendConfig})
          .on('end', done);
      });

      it('sets the eslintrc extends', () => {
        assert.jsonFileContent('.eslintrc', {extends: extendConfig});
      });
    });

    context('when provided by prompts', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withPrompts({extends: extendConfig})
          .on('ready', spyOnGenerator)
          .on('end', done);
      });

      it('sets the eslintrc extends', () => {
        assert.jsonFileContent('.eslintrc', {extends: extendConfig});
      });

      it('adds the extend config as a dependency', () => {
        let args = generator.npmInstall.lastCall.args;

        expect(args[1]).to.deep.equal({saveDev: true});
        expect(args[0]).to.include(`eslint-config-${extendConfig}`);
      });
    });

    context('when the exact config name is used', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withPrompts({extends: `eslint-config-${extendConfig}`})
          .on('ready', spyOnGenerator)
          .on('end', done);
      });

      it('sets the eslintrc extends', () => {
        assert.jsonFileContent('.eslintrc', {extends: extendConfig});
      });

      it('adds the extend config as a dependency', () => {
        let args = generator.npmInstall.lastCall.args;

        expect(args[1]).to.deep.equal({saveDev: true});
        expect(args[0]).to.include(`eslint-config-${extendConfig}`);
      });
    });

    context('when a plugin config is used', () => {
      context('when the shortened plugin name is used', () => {
        beforeEach((done) => {
          helpers
            .run(generatorIndex)
            .withPrompts({extends: `plugin:${extendConfig}/default`})
            .on('ready', spyOnGenerator)
            .on('end', done);
        });

        it('sets the eslintrc extends', () => {
          assert.jsonFileContent('.eslintrc', {extends: `plugin:${extendConfig}/default`});
        });

        it('adds the extend config as a dependency', () => {
          let args = generator.npmInstall.lastCall.args;

          expect(args[1]).to.deep.equal({saveDev: true});
          expect(args[0]).to.include(`eslint-plugin-${extendConfig}`);
        });
      });

      context('when the full plugin name is used', () => {
        beforeEach((done) => {
          helpers
            .run(generatorIndex)
            .withPrompts({extends: `plugin:eslint-plugin-${extendConfig}/default`})
            .on('ready', spyOnGenerator)
            .on('end', done);
        });

        it('sets the eslintrc extends', () => {
          assert.jsonFileContent('.eslintrc', {extends: `plugin:${extendConfig}/default`});
        });

        it('adds the extend config as a dependency', () => {
          let args = generator.npmInstall.lastCall.args;

          expect(args[1]).to.deep.equal({saveDev: true});
          expect(args[0]).to.include(`eslint-plugin-${extendConfig}`);
        });
      });

      context('when the full plugin name is used without the plugin: prefix', () => {
        beforeEach((done) => {
          helpers
            .run(generatorIndex)
            .withPrompts({extends: `eslint-plugin-${extendConfig}/default`})
            .on('ready', spyOnGenerator)
            .on('end', done);
        });

        it('sets the eslintrc extends', () => {
          assert.jsonFileContent('.eslintrc', {extends: `plugin:${extendConfig}/default`});
        });

        it('adds the extend config as a dependency', () => {
          let args = generator.npmInstall.lastCall.args;

          expect(args[1]).to.deep.equal({saveDev: true});
          expect(args[0]).to.include(`eslint-plugin-${extendConfig}`);
        });
      });
    });
  });

  describe('--plugins', () => {
    const plugins = ['one', 'plugin-two', 'eslint-plugin-three'];

    context('when provided by options', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withOptions({plugins: plugins.join(', ')})
          .on('end', done);
      });

      it('sets the eslintrc plugins', () => {
        assert.jsonFileContent('.eslintrc', {plugins: plugins.map(cleanName)});
      });
    });

    context('when provided by prompts', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withPrompts({plugins})
          .on('ready', spyOnGenerator)
          .on('end', done);
      });

      it('sets the eslintrc plugins', () => {
        assert.jsonFileContent('.eslintrc', {plugins: plugins.map(cleanName)});
      });

      it('installs the necessary plugin dependencies', () => {
        let args = generator.npmInstall.lastCall.args;

        expect(args[1]).to.deep.equal({saveDev: true});
        expect(args[0]).to.include(...plugins.map((plugin) => `eslint-plugin-${cleanName(plugin)}`));
      });
    });
  });

  describe('--babel', () => {
    beforeEach((done) => {
      helpers
        .run(generatorIndex)
        .withPrompts({babel: false})
        .on('ready', spyOnGenerator)
        .on('end', done);
    });

    it('does not include the babel-eslint parser', () => {
      expect(generator.npmInstall.lastCall.args[0]).not.to.include('babel-eslint');
    });

    it('uses reasonable defaults for the eslintrc', () => {
      let eslintConfig = JSON.parse(fs.readFileSync('.eslintrc').toString());
      expect(eslintConfig.env).to.deep.equal({});
      expect(eslintConfig.parser).to.be.undefined;
    });
  });

  describe('--ignore', () => {
    const ignore = ['foo/', 'bar/', 'baz/'];

    beforeEach((done) => {
      helpers
        .run(generatorIndex)
        .withPrompts({ignore: ignore.join(', ')})
        .on('end', done);
    });

    it('appends to the default exclusions', () => {
      assert.fileContent('.eslintignore', /coverage\//);
      assert.fileContent('.eslintignore', /node_modules\//);
      ignore.forEach((ignoreItem) => assert.fileContent('.eslintignore', ignoreItem));
    });
  });

  describe('--disableRules', () => {
    const disableRules = ['shopify/require-flow', 'no-var'];

    beforeEach((done) => {
      helpers
        .run(generatorIndex)
        .withPrompts({disableRules: disableRules.join(', ')})
        .on('end', done);
    });

    it('turns off the specified rules', () => {
      let expectedRules = {};
      disableRules.forEach((rule) => {
        expectedRules[rule] = 0;
      });

      assert.jsonFileContent('.eslintrc', {rules: expectedRules});
    });
  });

  describe('--configType', () => {
    describe('dotfile', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withPrompts({configType: 'dotfile'})
          .on('end', done);
      });

      it('creates a .eslintrc with the target contents', () => {
        assert.jsonFileContent('.eslintrc', {extends: 'eslint:recommended'});
      });
    });

    describe('javascript', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withPrompts({configType: 'javascript'})
          .on('end', done);
      });

      it('creates a .eslintrc.js with the target contents', () => {
        assert.fileContent('.eslintrc.js', 'module.exports = {');
        assert.fileContent('.eslintrc.js', 'extends: "eslint:recommended"');
      });
    });

    describe('package', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withPrompts({configType: 'package'})
          .on('end', done);
      });

      it('puts configuration in the package.json', () => {
        assert.jsonFileContent('package.json', {
          eslintConfig: {extends: 'eslint:recommended'},
        });
      });
    });
  });
});
