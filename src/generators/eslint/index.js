import _ from 'lodash';
import extend from 'deep-extend';
import {Base} from 'yeoman-generator';

module.exports = class ESLintGenerator extends Base {
  constructor(...args) {
    super(...args);

    this.option('extends', {
      type: String,
      required: false,
      desc: 'The ESLint configuration to extend.',
    });

    this.option('plugins', {
      type: String,
      required: false,
      desc: 'The ESLint plugins to install (comma-separated).',
    });
  }

  initializing() {
    let {extends: extendConfig, plugins} = this.options;

    this.props = {
      extends: extendConfig,
      plugins: plugins ? commaSeparated(String(plugins)) : [],
    };
  }

  prompting() {
    let done = this.async();
    let prompts = [
      {
        name: 'extends',
        message: 'The ESLint configuration to extend.',
        defaults: 'shopify',
        when: this.options.extends == null,
      },

      {
        name: 'plugins',
        message: 'The ESLint plugins to install (comma-separated).',
        defaults: 'shopify',
        filter: commaSeparated,
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
    let pkg = fs.readJSON(this.destinationPath('package.json'), {});

    let eslintConfig = {
      parser: 'babel-eslint',
    };

    let devDependencies = {
      eslint: '*',
      'babel-eslint': '*',
    };

    let {extends: extendConfig, plugins} = props;

    if (!_.isEmpty(extendConfig)) {
      eslintConfig.extends = cleanESLintName(extendConfig);
      devDependencies[packageName(extendConfig, {type: 'config'})] = '*';
    }

    if (!_.isEmpty(plugins)) {
      eslintConfig.plugins = plugins.map((plugin) => cleanESLintName(plugin));
      plugins.forEach((plugin) => {
        devDependencies[packageName(plugin, {type: 'plugin'})] = '*';
      });
    }

    extend(pkg, {devDependencies});

    fs.writeJSON(this.destinationPath('package.json'), pkg);
    fs.writeJSON(this.destinationPath('.eslintrc'), eslintConfig);
  }
};

function commaSeparated(list) {
  return list.split(/\s*,\s*/g);
}

function cleanESLintName(name) {
  return name.replace(/(eslint|config|plugin)\-/g, '');
}

function packageName(name, {type}) {
  return `eslint-${type}-${cleanESLintName(name).split(/[:\/]/)[0]}`;
}
