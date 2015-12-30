const rules = Object.freeze({
  // expect has some of these, like expect().to.be.empty
  'no-unused-expressions': 0,

  // need to put things in scope for beforeEach
  'init-declarations': 0,
});

const globals = Object.freeze({
  expect: false,
  assert: false,
  sinon: false,
});

export {globals, rules};
