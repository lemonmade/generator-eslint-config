import _ from 'lodash';
import {Base as BaseGenerator} from 'yeoman-generator';
import chalk from 'chalk';
import yosay from 'yosay';

import {globals as testGlobals, rules as testRules} from './test-overrides';
import ownPackage from '../../package.json';

module.exports = class ESLintGenerator extends BaseGenerator {
  constructor(...args) {
    super(...args);

    this.option('extends', {
      type: String,
      required: false,
      desc: 'The ESLint configuration to extend.',
    });

    this.option('envs', {
      type: String,
      required: false,
      desc: 'The ESLint environment(s) for this project (comma-separated).',
    });

    this.option('plugins', {
      type: String,
      required: false,
      desc: 'The ESLint plugins to install (comma-separated).',
    });

    this.option('babel', {
      type: Boolean,
      required: false,
      desc: 'Whether to use the Babel linter and ES6 env.',
    });

    this.option('testDir', {
      type: String,
      required: false,
      desc: 'The (relative) directory in which you place your tests.',
    });

    this.option('testFramework', {
      type: String,
      required: false,
      desc: 'The testing framework you use (mocha, jasmine, or jest).',
    });
  }

  initializing() {
    let {options} = this;

    this.props = {
      extends: options.extends,
      env: options.envs ? commaSeparated(String(options.envs)) : [],
      plugins: options.plugins ? commaSeparated(String(options.plugins)) : [],
      babel: options.babel,
      needsTests: options.testFramework != null || options.testDir != null,
      testFramework: options.testFramework,
      testDir: options.testDir,
      ignore: ['node_modules/', 'coverage/'],
    };
  }

  prompting() {
    let done = this.async();
    let {options} = this;

    if (!options.skipWelcomeMessage) {
      this.log(yosay(`Welcome to the ${chalk.red('eslint-config')} generator!`));
    }

    let prompts = [
      {
        name: 'extends',
        message: 'The ESLint configuration to extend.',
        default: 'shopify',
        when: options.extends == null,
      },

      {
        name: 'babel',
        message: 'Would you like to use the Babel parser?',
        type: 'confirm',
        default: true,
        when: options.babel == null,
      },

      {
        name: 'env',
        message: 'The ESLint environment(s) for this project.',
        type: 'checkbox',
        choices: [
          {name: 'browser'},
          {name: 'node'},
          {name: 'jquery'},
        ],
        default: [],
        when: options.envs == null,
      },

      {
        name: 'plugins',
        message: 'The ESLint plugins to install (comma-separated).',
        default: 'shopify',
        filter: commaSeparated,
        when: options.plugins == null,
      },

      {
        name: 'ignore',
        message: 'The files and directories to ignore (comma-seperated).',
        filter: commaSeparated,
      },

      {
        name: 'needsTests',
        message: 'Do you want to lint your tests?',
        type: 'confirm',
        default: true,
        when: options.testFramework == null && options.testDir == null,
      },

      {
        name: 'testFramework',
        message: 'What testing framework do you use?',
        type: 'list',
        choices: ['Mocha', 'Jasmine', 'Jest'],
        default: 'Mocha',
        when({needsTests}) {
          return options.testFramework == null && (needsTests || options.testDir != null);
        },
      },

      {
        name: 'testDir',
        message: 'What directory are your tests in?',
        default: 'test',
        when({needsTests}) {
          return options.testDir == null && (needsTests || options.testFramework != null);
        },
      },
    ];

    this.prompt(prompts, (newProps) => {
      this.props = _.merge(this.props, newProps, (first, second) => {
        if (_.isArray(first)) {
          // for tests - the helper does not run the filter on prompts.
          if (second == null) { return first; }
          if (typeof second === 'string') { second = commaSeparated(second); }
          return [...first, ...second];
        }

        if (_.isArray(first) && _.isArray(second)) {
          return [...first, ...second];
        }
      });

      done();
    });
  }

  writing() {
    let pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
    _.merge(pkg, {scripts: {lint: ownPackage.scripts.lint}});
    this.fs.writeJSON(this.destinationPath('package.json'), pkg);

    let {fs, props} = this;

    let env = {};
    let install = ['eslint'];

    if (!_.isEmpty(props.env)) {
      props.env.forEach((environment) => env[environment] = true);
    }

    if (props.babel) {
      install.push('babel-eslint');
      env.es6 = true;
    }

    let eslintConfig = {
      parser: 'babel-eslint',
      env,
      rules: {},
    };

    if (!_.isEmpty(props.extends)) {
      eslintConfig.extends = cleanESLintName(props.extends);
      install.push(packageName(props.extends, {type: 'config'}));
    }

    if (!_.isEmpty(props.plugins)) {
      eslintConfig.plugins = props.plugins.map((plugin) => cleanESLintName(plugin));
      install.push(...props.plugins.map((plugin) => packageName(plugin, {type: 'plugin'})));
    }

    fs.writeJSON(this.destinationPath('.eslintrc'), arrangeConfig(eslintConfig));
    this.npmInstall(install, {saveDev: true});

    if (props.ignore.length) {
      fs.write(this.destinationPath('.eslintignore'), props.ignore.join('\n'));
    }

    if (props.needsTests && props.testDir) {
      let testEnv = {...env};
      if (props.testFramework != null) {
        testEnv[props.testFramework.toLowerCase()] = true;
      }

      fs.writeJSON(this.destinationPath(`${props.testDir.replace(/\/$/, '')}/.eslintrc`), arrangeConfig({
        env: testEnv,
        globals: testGlobals,
        rules: testRules,
      }));
    }
  }

  installing() {
    this.installDependencies({bower: false});
  }
};

const configOrder = [
  'extends',
  'parser',
  'plugins',
  'env',
  'globals',
  'rules',
];

function arrangeConfig(config) {
  let arrangedConfig = {};

  configOrder.forEach((key) => {
    if (config[key] != null) { arrangedConfig[key] = config[key]; }
  });

  return arrangedConfig;
}

function commaSeparated(list) {
  return list.split(/\s*,\s*/g);
}

function cleanESLintName(name) {
  return name.replace(/(eslint|config|plugin)\-/g, '');
}

function packageName(name, {type}) {
  return `eslint-${type}-${cleanESLintName(name).split(/[:\/]/)[0]}`;
}
