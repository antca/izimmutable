import i from '..';

function assert(condition) {
  if(!condition) {
    throw new Error('Assertion failed !');
  }
}

function testAssignation(obj) {
  if(!(obj instanceof Object)) {
    return;
  }
  Object.keys(obj).concat(Math.random()).map((key) => {
    let didThrow = false;
    try {
      obj[key] = null;
    }
    catch(error){
      didThrow = true;
    }
    if(!didThrow) {
      throw new Error('Assignation succeed !');
    }
    testAssignation(obj[key]);
  });
}

const tests = {
  'Root objects should be different'() {
    const orig = { hello: 'world' };
    const o1 = i(orig)();
    const o2 = i(orig)();
    assert(o1 !== o2);

    testAssignation(o1);
    testAssignation(o2);
  },
  'Internal objects should have the same references'() {
    const obj = i({ a: { hello: 'world' }, b: { hello: 'planet' } });
    const o1 = obj();
    const o2 = obj({ a: { hello: 'test' } })();

    assert(o1 !== o2);
    assert(o1.b === o2.b);
    assert(o1.a !== o2.a);

    testAssignation(o1);
    testAssignation(o2);
  },
  'Internal arrays should have the same references'() {
    const obj = i({ a: { hello: 'world' }, b: ['a', 'b', 'c'] });
    const o1 = obj();
    const o2 = obj({ a: { hello: 'test' } })();

    assert(o1 !== o2);
    assert(o1.b === o2.b);
    assert(o1.a !== o2.a);

    testAssignation(o1);
    testAssignation(o2);
  },
  'Assignation via function should work'() {
    const obj = i({ hello: 'world' });
    const o1 = obj();
    const o2 = obj({ hello: () => 'banana' })();

    assert(o2.hello === 'banana');

    testAssignation(o1);
    testAssignation(o2);
  },
  'Assignation on primitives should work'() {
    const obj = i('hello');
    const o1 = obj();
    const o2 = obj(() => 'world')();

    assert(o1 === 'hello');

    testAssignation(o1);
    testAssignation(o2);
  },
  'Undefined Izimmutable should be valid'() {
    const obj = i();
    const o1 = obj();
    const o2 = obj('hello')();

    assert(o1 === void 0);
    assert(o2 === 'hello');

    testAssignation(o1);
    testAssignation(o2);
  },
  'New properties should be created'() {
    const obj = i({ hello: { world: 'hey' } });
    const o1 = obj({ hello: { test: 'planet' } })();
    assert(o1.hello.test === 'planet');

    testAssignation(o1);
  },
  'Cascade functions should work correctly'() {
    const obj = i({ hello: 'world' });
    const o1 = obj({
      hello(x) {
        return {
          reverse: x.split('').reverse().join(''),
          letters: () => x.split(''),
        }
      },
    })();
    assert(o1.hello.reverse === 'dlrow');
    assert(Array.isArray(o1.hello.letters));
    assert(o1.hello.letters[1] === 'o');

    testAssignation(o1);
  },
  'Function return value should override existing value'() {
    const obj = i({ hello: { w: 'o', r: 'ld' } });
    const o1 = obj({ hello: () => ({ wo: 'rld' }) })();

    assert(o1.hello.wo === 'rld');

    testAssignation(o1);
  },
  'Array as base object should work'() {
    const obj = i(['h', 'e', 'llo']);
    const o1 = obj({ 1: 'a' })();

    assert(Array.isArray(o1));
    assert(o1.join('') === 'hallo');

    testAssignation(o1);
  },
  'Functions should not be in result object even frozen'() {
    const obj = i({ hello: 'world' });
    const o1 = obj({ hello: Object.freeze(() => 'planet') })();
    assert(!(typeof o1.hello === 'function'));
    assert(o1.hello === 'planet');

    testAssignation(o1);
  },
  'Already frozen objects should not be cloned'() {
    const orig = Object.freeze({ hello: 'world' });
    const obj = i(orig);
    assert(orig === obj());
  },
  'Exisiting primitive should be replaced by object'() {
    const obj = i('hello');
    const o1 = obj({ hello: 'world' })();
    assert(o1.hello === 'world');

    testAssignation(o1);
  },
  'Exisiting falsy value should be replaced by object'() {
    const obj = i(null);
    const o1 = obj({ hello: 'world' })();
    assert(o1.hello === 'world');

    testAssignation(o1);
  },
  'Arrays copied from empty arrays should be empty'(){
    const obj = i([]);
    assert(obj().length === 0);
    testAssignation(obj());
  },
};

Object.keys(tests).map((key) => {
  try {
    tests[key]();
    console.log(`<${key}> OK`);
  }
  catch(error) {
    console.error(`<${key}> FAILED !`);
    throw error;
  }
});
