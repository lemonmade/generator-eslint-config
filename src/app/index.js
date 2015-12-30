import _ from 'lodash';
import {Base} from 'yeoman-generator';
import {globals as testGlobals, rules as testRules} from './test-overrides';

module.exports = class ESLintGenerator extends Base {
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
      needsTests: options.testFramework != null || options.testDir != null,
      testFramework: options.testFramework,
      testDir: options.testDir,
    };
  }

  prompting() {
    let done = this.async();
    let {options} = this;

    let prompts = [
      {
        name: 'extends',
        message: 'The ESLint configuration to extend.',
        default: 'shopify',
        when: options.extends == null,
      },

      {
        name: 'env',
        message: 'The ESLint environment(s) for this project.',
        type: 'checkbox',
        choices: [
          {name: 'es6', checked: true},
          {name: 'browser'},
          {name: 'node'},
          {name: 'jquery'},
        ],
        default: ['es6'],
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
        name: 'needsTests',
        message: 'Do you use a testing framework?',
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

    this.prompt(prompts, (props) => {
      this.props = _.merge(this.props, props, (first, second) => {
        if (_.isArray(first) && _.isArray(second)) {
          return [...first, ...second];
        }
      });

      done();
    });
  }

  writing() {
    let {fs, props} = this;

    let env = {};
    let install = [];

    if (!_.isEmpty(props.env)) {
      props.env.forEach((environment) => env[environment] = true);
    }

    let eslintConfig = {
      parser: 'babel-eslint',
      env,
      rules: {},
    };

    install.push('eslint', 'babel-eslint');

    if (!_.isEmpty(props.extends)) {
      eslintConfig.extends = cleanESLintName(props.extends);
      install.push(packageName(props.extends, {type: 'config'}));
    }

    if (typeof props.plugins === 'string') {
      // for tests - the helper does not run the filter on prompts.
      props.plugins = commaSeparated(props.plugins);
    }

    if (!_.isEmpty(props.plugins)) {
      eslintConfig.plugins = props.plugins.map((plugin) => cleanESLintName(plugin));
      install.push(...props.plugins.map((plugin) => packageName(plugin, {type: 'plugin'})), {saveDev: true});
    }

    fs.writeJSON(this.destinationPath('.eslintrc'), arrangeConfig(eslintConfig));
    this.npmInstall(install, {saveDev: true});

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
