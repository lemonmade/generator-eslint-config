// Set up sinon and chai

import sinon from 'sinon';
import chai, {expect} from 'chai';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

global.sinon = sinon;
global.expect = expect;

global.print = ::console.log; // eslint-disable-line no-console
