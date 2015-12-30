// Set up sinon and chai

import sinon from 'sinon';
import chai, {expect} from 'chai';
import assert from 'yeoman-assert';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

global.sinon = sinon;
global.assert = assert;
global.expect = expect;

// Set up the DOM

global.print = ::console.log; // eslint-disable-line no-console
