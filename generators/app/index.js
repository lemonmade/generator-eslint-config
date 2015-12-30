'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _inquirerNpmName = require('inquirer-npm-name');

var _inquirerNpmName2 = _interopRequireDefault(_inquirerNpmName);

var _yeomanGenerator = require('yeoman-generator');

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = (function (_Base) {
  _inherits(ESNextGenerator, _Base);

  function ESNextGenerator() {
    var _Object$getPrototypeO;

    _classCallCheck(this, ESNextGenerator);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(ESNextGenerator)).call.apply(_Object$getPrototypeO, [this].concat(args)));
  }

  _createClass(ESNextGenerator, [{
    key: 'initializing',
    value: function initializing() {
      this.props = {};
    }
  }, {
    key: 'prompting',
    value: function prompting() {
      var _this2 = this;

      var done = this.async();

      (0, _inquirerNpmName2.default)({
        name: 'name',
        message: 'Your generator name',
        default: makeGeneratorName(_path2.default.basename(process.cwd())),
        filter: makeGeneratorName,
        validate: function validate(str) {
          return str.length > 0;
        }
      }, this, function (name) {
        _this2.props.name = name;
        done();
      });
    }
  }, {
    key: 'defaults',
    value: function defaults() {
      var name = this.props.name;

      if (_path2.default.basename(this.destinationPath()) !== name) {
        this.log('\n        Your generator must be inside a folder named ' + name + '.\n        Don\'t worry, I\'ll automatically create it for you!\n      ');

        (0, _mkdirp2.default)(name);
        this.destinationRoot(this.destinationPath(name));
      }

      // let readmeTemplate = _.template(this.fs.read(this.templatePath('README.md')));
    }
  }, {
    key: 'writing',
    value: function writing() {}
  }, {
    key: 'install',
    value: function install() {
      this.installDependencies({ bower: false });
    }
  }]);

  return ESNextGenerator;
})(_yeomanGenerator.Base);

function makeGeneratorName(name) {
  name = _lodash2.default.kebabCase(name);
  return name.indexOf('generator-') === 0 ? name : 'generator-' + name;
}