# generator-eslint-config

[![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Build Status][travis-image]][travis-url] [![Coverage percentage][coveralls-image]][coveralls-url]

> A Yeoman generator for creating a complete ESLint config.

## Installation

First, install [Yeoman](http://yeoman.io) and generator-esnext-test using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-eslint-config
```

Then generate your new project:

```bash
yo eslint-config
```

## What You Get

The following is installed by this generator (`test/.eslintrc` is only installed when the `needsTest` option/ prompt is true, and the test directory can be configured with the `testDir` option/ prompt):

```
|-- .eslintrc
|-- .eslintignore
|-- test/
  |-- .eslintrc
```

The generator prompts will take you through setting up your config, including what configuration to extend, what plugins to install, and directories and rules to ignore. The `package.json` file is created if it does not exist, and the `scripts` property is augmented with a `lint` command.

## Getting To Know Yeoman

 * Yeoman has a heart of gold.
 * Yeoman is a person with feelings and opinions, but is very easy to work with.
 * Yeoman can be too opinionated at times but is easily convinced not to be.
 * Feel free to [learn more about Yeoman](http://yeoman.io/).

## License

 © Chris Sauve

[npm-image]: https://badge.fury.io/js/generator-eslint-config.svg
[npm-url]: https://npmjs.org/package/generator-eslint-config

[daviddm-image]: https://david-dm.org/lemonmade/generator-eslint-config.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/lemonmade/generator-eslint-config

[travis-image]: https://travis-ci.org/lemonmade/generator-eslint-config.svg?branch=master
[travis-url]: https://travis-ci.org/lemonmade/generator-eslint-config

[coveralls-image]: https://coveralls.io/repos/lemonmade/generator-eslint-config/badge.svg
[coveralls-url]: https://coveralls.io/r/lemonmade/generator-eslint-config
