'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _yeomanGenerator = require('yeoman-generator');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var testRuleOverrides = Object.freeze({
  // expect has some of these, like expect().to.be.empty
  'no-unused-expressions': 0,

  // need to put things in scope for beforeEach
  'init-declarations': 0
});

var testGlobals = Object.freeze({
  expect: false,
  assert: false,
  sinon: false
});

module.exports = (function (_Base) {
  _inherits(ESLintGenerator, _Base);

  function ESLintGenerator() {
    var _Object$getPrototypeO;

    _classCallCheck(this, ESLintGenerator);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(ESLintGenerator)).call.apply(_Object$getPrototypeO, [this].concat(args)));

    _this.option('extends', {
      type: String,
      required: false,
      desc: 'The ESLint configuration to extend.'
    });

    _this.option('envs', {
      type: String,
      required: false,
      desc: 'The ESLint environment(s) for this project (comma-separated).'
    });

    _this.option('plugins', {
      type: String,
      required: false,
      desc: 'The ESLint plugins to install (comma-separated).'
    });

    _this.option('testDir', {
      type: String,
      required: false,
      desc: 'The (relative) directory in which you place your tests.'
    });

    _this.option('testFramework', {
      type: String,
      required: false,
      desc: 'The testing framework you use (mocha, jasmine, or jest).'
    });
    return _this;
  }

  _createClass(ESLintGenerator, [{
    key: 'initializing',
    value: function initializing() {
      var options = this.options;

      this.props = {
        extends: options.extends,
        env: options.envs ? commaSeparated(String(options.env)) : [],
        plugins: options.plugins ? commaSeparated(String(options.plugins)) : [],
        needsTests: options.testingFramework != null || options.testingDir != null,
        testingFramework: options.testingFramework,
        testingDir: options.testingDir
      };
    }
  }, {
    key: 'prompting',
    value: function prompting() {
      var _this2 = this;

      var done = this.async();
      var options = this.options;

      var prompts = [{
        name: 'extends',
        message: 'The ESLint configuration to extend.',
        default: 'shopify',
        when: options.extends == null
      }, {
        name: 'env',
        message: 'The ESLint environment(s) for this project.',
        type: 'checkbox',
        choices: [{ name: 'es6', checked: true }, { name: 'browser' }, { name: 'node' }, { name: 'jquery' }],
        when: options.envs == null
      }, {
        name: 'plugins',
        message: 'The ESLint plugins to install (comma-separated).',
        default: 'shopify',
        filter: commaSeparated
      }, {
        name: 'needsTests',
        message: 'Do you use a testing framework?',
        type: 'confirm',
        default: true,
        when: options.testingFramework == null && options.testingDir == null
      }, {
        name: 'testingFramework',
        message: 'What testing framework do you use?',
        type: 'list',
        choices: ['Mocha', 'Jasmine', 'Jest'],
        when: function when(_ref) {
          var needsTests = _ref.needsTests;

          return options.testingFramework == null && (needsTests || options.testingDir != null);
        }
      }, {
        name: 'testingDir',
        message: 'What directory are your tests in?',
        default: 'tests',
        when: function when(_ref2) {
          var needsTests = _ref2.needsTests;

          return options.testingDir == null && (needsTests || options.testingFramework != null);
        }
      }];

      this.prompt(prompts, function (props) {
        _this2.props = _lodash2.default.merge(_this2.props, props, function (first, second) {
          if (_lodash2.default.isArray(first) && _lodash2.default.isArray(second)) {
            return [].concat(_toConsumableArray(first), _toConsumableArray(second));
          }
        });

        done();
      });
    }
  }, {
    key: 'writing',
    value: function writing() {
      var fs = this.fs;
      var props = this.props;

      var env = {};
      var install = [];

      if (!_lodash2.default.isEmpty(props.env)) {
        props.env.forEach(function (environment) {
          return env[environment] = true;
        });
      }

      var eslintConfig = {
        parser: 'babel-eslint',
        env: env,
        rules: {}
      };

      install.push('eslint', 'babel-eslint');
      // this.npmInstall(['eslint', 'babel-eslint'], {saveDev: true});

      if (!_lodash2.default.isEmpty(props.extends)) {
        eslintConfig.extends = cleanESLintName(props.extends);
        install.push(packageName(props.extends, { type: 'config' }));
        // this.npmInstall([packageName(props.extends, {type: 'config'})], {saveDev: true});
      }

      if (!_lodash2.default.isEmpty(props.plugins)) {
        eslintConfig.plugins = props.plugins.map(function (plugin) {
          return cleanESLintName(plugin);
        });
        install.push.apply(install, _toConsumableArray(props.plugins.map(function (plugin) {
          return packageName(plugin, { type: 'plugin' });
        })).concat([{ saveDev: true }]));
      }

      fs.writeJSON(this.destinationPath('.eslintrc'), arrangeConfig(eslintConfig));

      if (props.needsTests && props.testingDir) {
        var testEnv = _extends({}, env);
        if (props.testingFramework != null) {
          testEnv[props.testingFramework.toLowerCase()] = true;
        }

        fs.writeJSON(this.destinationPath(props.testingDir.replace(/\/$/, '') + '/.eslintrc'), arrangeConfig({
          env: testEnv,
          globals: testGlobals,
          rules: testRuleOverrides
        }));
      }
    }
  }, {
    key: 'installing',
    value: function installing() {
      this.installDependencies({ bower: false });
    }
  }]);

  return ESLintGenerator;
})(_yeomanGenerator.Base);

var configOrder = ['extends', 'parser', 'plugins', 'env', 'globals', 'rules'];

function arrangeConfig(config) {
  var arrangedConfig = {};

  configOrder.forEach(function (key) {
    if (config[key] != null) {
      arrangedConfig[key] = config[key];
    }
  });

  return arrangedConfig;
}

function commaSeparated(list) {
  return list.split(/\s*,\s*/g);
}

function cleanESLintName(name) {
  return name.replace(/(eslint|config|plugin)\-/g, '');
}

function packageName(name, _ref3) {
  var type = _ref3.type;

  return 'eslint-' + type + '-' + cleanESLintName(name).split(/[:\/]/)[0];
}