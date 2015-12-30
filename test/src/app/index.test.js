import '../../helper';

import fs from 'fs';
import path from 'path';
import helpers from 'yeoman-test';
import {globals as testGlobals, rules as testRules} from '../../../src/app/test-overrides';

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
        extends: 'shopify',
        parser: 'babel-eslint',
        plugins: ['shopify'],
        env: {es6: true},
        rules: {},
      });
    });

    it('uses reasonable defaults for the test eslintrc', () => {
      assert.jsonFileContent('tests/.eslintrc', {
        env: {es6: true, mocha: true},
        globals: testGlobals,
        rules: testRules,
      });
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

      ['.eslintrc', 'tests/.eslintrc'].forEach((file) => {
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
        'eslint-config-shopify',
        'eslint-plugin-shopify'
      );
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
        assert.jsonFileContent('tests/.eslintrc', {
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
        assert.jsonFileContent('tests/.eslintrc', {
          env: {...expectedEnv, [testFramework]: true},
        });
      });
    });
  });

  describe('--extends', () => {
    const extendConfig = 'shopify';

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
        expect(args[0]).to.include('eslint', `eslint-config-${extendConfig}`);
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
        expect(args[0]).to.include('eslint', `eslint-config-${extendConfig}`);
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

  describe('--needsTests', () => {
    beforeEach((done) => {
      helpers
        .run(generatorIndex)
        .withPrompts({needsTests: false})
        .on('end', done);
    });

    it('does not write any test eslintrc file', () => {
      assert.noFile('tests/.eslintrc');
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
        assert.jsonFileContent('tests/.eslintrc', {
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
        assert.jsonFileContent('tests/.eslintrc', {
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
