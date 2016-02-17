import '../../helper';

import fs from 'fs';
import path from 'path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';

import {globals as testGlobals, rules as testRules} from '../../../src/app/test-overrides';
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

    it('uses reasonable defaults for the test eslintrc', () => {
      assert.jsonFileContent('test/.eslintrc', {
        env: {es6: true, mocha: true},
        globals: testGlobals,
        rules: testRules,
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

      ['.eslintrc', 'test/.eslintrc'].forEach((file) => {
        let eslintConfig = JSON.parse(fs.readFileSync(file).toString());
        let lastIndex = -1;

        Object.keys(eslintConfig).forEach((key) => {
          let indexOfKey = configOrder.indexOf(key);
          expect(indexOfKey).to.be.greaterThan(lastIndex);
          lastIndex = indexOfKey;
        });
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

      it('sets the correct test env', () => {
        assert.jsonFileContent('test/.eslintrc', {
          env: {...expectedEnv, [testFramework]: true},
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

      it('sets the correct test env', () => {
        assert.jsonFileContent('test/.eslintrc', {
          env: {...expectedEnv, [testFramework]: true},
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

    it('uses reasonable defaults for the test eslintrc', () => {
      assert.jsonFileContent('test/.eslintrc', {env: {mocha: true}});
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

  describe('--needsTests', () => {
    beforeEach((done) => {
      helpers
        .run(generatorIndex)
        .withPrompts({needsTests: false})
        .on('end', done);
    });

    it('does not write any test eslintrc file', () => {
      assert.noFile('test/.eslintrc');
    });

    it('adds the common default test directories to the eslintignore', () => {
      assert.fileContent('.eslintignore', 'test/');
      assert.fileContent('.eslintignore', 'spec/');
    });
  });

  describe('--testFramework', () => {
    const nonDefaultFramework = 'jasmine';

    context('when provided by options', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withOptions({testFramework: nonDefaultFramework})
          .on('end', done);
      });

      it('sets the correct test framework env', () => {
        assert.jsonFileContent('test/.eslintrc', {
          env: {[nonDefaultFramework]: true},
        });
      });
    });

    context('when provided by prompt', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withPrompts({testFramework: nonDefaultFramework})
          .on('end', done);
      });

      it('sets the correct test framework env', () => {
        assert.jsonFileContent('test/.eslintrc', {
          env: {[nonDefaultFramework]: true},
        });
      });
    });
  });

  describe('--testDir', () => {
    const nonDefaultFolder = 'spec';

    context('when provided by options', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withOptions({testDir: nonDefaultFolder})
          .on('end', done);
      });

      it('puts the eslint file in the correct directory', () => {
        assert.file(`${nonDefaultFolder}/.eslintrc`);
      });
    });

    context('when provided by prompt', () => {
      beforeEach((done) => {
        helpers
          .run(generatorIndex)
          .withPrompts({testDir: nonDefaultFolder})
          .on('end', done);
      });

      it('puts the eslint file in the correct directory', () => {
        assert.file(`${nonDefaultFolder}/.eslintrc`);
      });
    });
  });
});
