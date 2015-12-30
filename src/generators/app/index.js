import _ from 'lodash';
import path from 'path';
import mkdir from 'mkdirp';
import checkName from 'inquirer-npm-name';
import {Base} from 'yeoman-generator';
import ownPackage from '../../package.json';

module.exports = class ESNextGenerator extends Base {
  initializing(...args) {
    super(...args);
    this.props = {};
  }

  prompting() {
    let done = this.async();

    checkName({
      name: 'name',
      message: 'Your generator name',
      default: makeGeneratorName(path.basename(process.cwd())),
      filter: makeGeneratorName,
      validate(str) { return str.length > 0; },
    }, this, (name) => {
      this.props.name = name;
      done();
    });
  }

  defaults() {
    let {name} = this.props;

    if (path.basename(this.destinationPath()) !== name) {
      this.log(`
        Your generator must be inside a folder named ${name}.
        Don't worry, I'll automatically create it for you!
      `);

      mkdir(name);
      this.destinationRoot(this.destinationPath(name));
    }

    // let readmeTemplate = _.template(this.fs.read(this.templatePath('README.md')));
  }

  writing() {}

  install() {
    this.installDependencies({bower: false});
  }
};

function makeGeneratorName(name) {
  name = _.kebabCase(name);
  return name.indexOf('generator-') === 0 ? name : `generator-${name}`;
}
