import '../../helper';

import mockery from 'mockery';
import path from 'path';
import helpers from 'yeoman-test';

describe('generator:app', () => {
  // beforeEach(() => {
  //   mockery.enable({
  //     warnOnReplace: false,
  //     warnOnUnregistered: false,
  //   });

  //   mockery.registerMock('npm-name', (name, callback) => {
  //     callback(null, true);
  //   });
  // });

  // afterEach(() => {
  //   mockery.disable();
  // });

  // describe('defaults', () => {
  //   const name = 'generator-temp';

  //   beforeEach((done) => {
  //     helpers
  //       .run(path.join(__dirname, '../../../generators/app'))
  //       .withPrompts({name})
  //       .on('end', done);
  //   });

  //   it('creates and enters into a folder named for the generator', () => {
  //     assert.equal(path.basename(process.cwd()), name);
  //   });

  //   it('creates files', () => {
  //     let expected = [
  //       'README.md',
  //       'package.json',
  //       'generators/app/index.js',
  //       'generators/app/templates/dummyfile.txt',
  //       'test/app.js',
  //     ];

  //     assert.file(expected);
  //   });

  //   it('fills package.json with correct information', () => {
  //     assert.JSONFileContent('package.json', { // eslint-disable-line new-cap
  //       name: 'generator-temp',
  //       dependencies: {
  //         'yeoman-generator': '^0.21.1',
  //         chalk: '^1.0.0',
  //         yosay: '^1.0.2',
  //       },
  //       devDependencies: {
  //         'yeoman-assert': '^2.0.0',
  //       },
  //       keywords: ['yeoman-generator'],
  //     });
  //   });

  //   it('fills the README with project data', () => {
  //     assert.fileContent('README.md', '# generator-temp');
  //     assert.fileContent('README.md', 'npm install -g yo');
  //     assert.fileContent('README.md', 'npm install -g generator-temp');
  //     assert.fileContent('README.md', 'yo temp');
  //     assert.fileContent('README.md', 'yeoman/generator-temp');
  //   });
  // });
});

