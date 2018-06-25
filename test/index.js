const assert = require('assert');
const { primitiveObserver,
  objectObserver,
  mapObserver,
  arrayObserver } = require('../index');

// -- Primitive Observer

describe('primitiveObserver', function () {
  it('should update when a new value is set', function (done) {
    let watcher = primitiveObserver('foo', (val) => {
      assert.equal(watcher.data, 'bar')
      assert.equal(val, 'bar')
      done()
    })
    watcher.data = 'bar'
  });
  it('should pass old value in onUpdate', function (done) {
    let watcher = primitiveObserver('foo', (newValue, oldValue) => {
      assert.equal(oldValue, 'foo')
      done()
    }, true)
    watcher.data = 'bar'
  })
  it('should not fire if original value is later mutated', (done) => {
    let subject = false
    let watcher = primitiveObserver(subject, (val) => {
      assert.equal(val, true)
      done()
    })
    subject = 'should fail'
    watcher.data = true
  })
  it('should throw if non-primitive is passed as first param', function () {
    assert.throws(() => primitiveObserver({}), Error)
    assert.throws(() => primitiveObserver([]), Error)
    assert.throws(() => primitiveObserver(new Map()), Error)
    assert.throws(() => primitiveObserver(new Set()), Error)
    assert.throws(() => primitiveObserver(function () { }), Error)
  })
})
describe('primitiveObserver.subscribe', function () {
  it('should allow the subscription of multiple callbacks', function () {
    let subject = 0
    let watcher = primitiveObserver(false)
    watcher.subscribe(() => { subject++ })
    watcher.subscribe(() => { subject = subject + 2 })
    watcher.data = true
    assert.equal(subject, 3)
  })
})
describe('primitiveObserver.unsubscribe', function () {
  it('should remove a callback on unsubscribe', function () {
    let subject = 0
    let watcher = primitiveObserver(false)
    const addOne = () => { subject++ }
    const addTwo = () => { subject = subject + 2 }
    watcher.subscribe(addOne)
    watcher.subscribe(addTwo)
    // modify data twice; 2nd time unsubscribing addTwo.
    watcher.data = true
    watcher.unsubscribe(addTwo)
    watcher.data = false
    assert.equal(subject, 4)
  })
})


// -- Object Observer

describe('objectObserver', function () {
  context('Object literal', function () {
    const expected = [
      { x: 2 },
      { x: undefined },
      { x: null },
      { x: null, y: 'foo' },
      { x: null }
    ]
    const runMutations = function (watcher) {

      // reassignment
      watcher.data.x = 2
      watcher.data.x = undefined
      watcher.data.x = null

      // key addition
      watcher.data.y = 'foo'

      // key deletion
      delete watcher.data.y
    }
    it('should fire callback when data is updated', function (done) {
      let counter = 0
      let watcher = objectObserver({ x: 1 }, (data) => {
        assert.deepEqual(data, expected[counter])
        assert.deepEqual(watcher.data, expected[counter])
        if (counter + 1 < expected.length) return counter++;
        done()
      })
      runMutations(watcher)
    })
    it('should pass clone of old data if third argument is true', function (done) {
      let counter = 0
      let watcher = objectObserver({ x: 1 }, (_, oldValue) => {
        if (counter > 0)
          assert.deepEqual(oldValue, expected[counter - 1])
        else
          assert.deepEqual(oldValue, { x: 1 })
        if (counter + 1 < expected.length) return counter++;
        done()
      }, true)
      runMutations(watcher)
    })
    it('should not fire if original object is later mutated', function (done) {
      let subject = { x: false }
      let watcher = objectObserver(subject, ({ x }) => {
        assert.equal(x, true)
        done()
      })
      subject.x = 'should fail'
      watcher.data.x = true
    })
    it('should throw if non-object literal is passed as first param', function () {
      assert.throws(() => objectObserver(false), Error)
      assert.throws(() => objectObserver('foo'), Error)
      assert.throws(() => objectObserver(new Map()), Error)
      assert.throws(() => objectObserver(new Set()), Error)
      assert.throws(() => objectObserver([]), Error)
    })
  })
})
describe('objectObserver.subscribe', function () {
  it('should allow the subscription of multiple callbacks', function () {
    let subject = 0
    let watcher = objectObserver({ x: 1 })
    watcher.subscribe(() => { subject++ })
    watcher.subscribe(() => { subject = subject + 2 })
    watcher.data.x = true
    assert.equal(subject, 3)
  })
})
describe('objectObserver.unsubscribe', function () {
  it('should remove a callback on unsubscribe', function () {
    let subject = 0
    let watcher = objectObserver({ x: 1 })
    const addOne = () => { subject++ }
    const addTwo = () => { subject = subject + 2 }
    watcher.subscribe(addOne)
    watcher.subscribe(addTwo)
    // modify data twice; 2nd time unsubscribing addTwo.
    watcher.data.x = true
    watcher.unsubscribe(addTwo)
    watcher.data.x = false
    assert.equal(subject, 4)
  })
})



// -- Array Observer

describe('arrayObserver', function () {
  it('should fire callback when data is updated', function (done) {
    const expected = [
      [1, 2],
      [1, 2, 'foo'],
      // push fires twice here because the proxy's update function is called twice
      // once to update the array length and another time to set the value
      [1, 2, 'foo'],
      [1, 2, 'bar'],
      [1, 2, 'bar', , , 5],
      [1, 2, 'bar', , , undefined]
    ]
    let counter = 0
    let watcher = arrayObserver([1, 2, 3], (val) => {
      assert.deepEqual(watcher.data, expected[counter])
      assert.deepEqual(val, expected[counter])
      if (counter + 1 < expected.length) return counter++;
      done()
    })

    // removal
    watcher.data.pop()

    // addition
    watcher.data.push('foo')

    // reassignment
    watcher.data[2] = 'bar'
    watcher.data[5] = 5
    watcher.data[5] = undefined
  })
  it('should pass clone of old data if third argument is true', function (done) {
    let counter = 0
    let watcher = arrayObserver([1, 2, 3], (newValue, oldValue) => {
      assert.deepEqual(oldValue, [1, 2, 3])
      assert.deepEqual(newValue, ['bar', 2, 3])
      done()
    }, true)
    watcher.data[0] = 'bar'
  })
  it('should not fire if original array is later mutated', function (done) {
    let subject = [false, false]
    let watcher = arrayObserver(subject, (s) => {
      assert.equal(s[0], true)
      done()
    })
    subject[0] = 'should fail'
    watcher.data[0] = true
  })
  it('should throw if non-array is passed as first param', function () {
    assert.throws(() => arrayObserver(false), Error)
    assert.throws(() => arrayObserver('foo'), Error)
    assert.throws(() => arrayObserver(new Map()), Error)
    assert.throws(() => arrayObserver(new Set()), Error)
    assert.throws(() => arrayObserver({}), Error)
  })
})
describe('arrayObserver.subscribe', function () {
  it('should allow the subscription of multiple callbacks', function () {
    let subject = 0
    let watcher = arrayObserver([])
    watcher.subscribe(() => { subject++ })
    watcher.subscribe(() => { subject = subject + 2 })
    watcher.data[0] = true
    assert.equal(subject, 3)
  })
})
describe('arrayObserver.unsubscribe', function () {
  it('should remove a callback on unsubscribe', function () {
    let subject = 0
    let watcher = arrayObserver([])
    const addOne = () => { subject++ }
    const addTwo = () => { subject = subject + 2 }
    watcher.subscribe(addOne)
    watcher.subscribe(addTwo)
    watcher.data[0] = true
    watcher.unsubscribe(addTwo)
    watcher.data[0] = false
    assert.equal(subject, 4)
  })
})



// -- Map Observer

describe('mapObserver', function () {
  it('should fire callback when data is updated', function (done) {
    let mappy = new Map()
    mappy.set('x', 'foo')
    mappy.set('y', 2)
    let watcher = mapObserver(mappy, () => {
      assert.equal(watcher.data.get('x'), 'bar')
      assert.equal(watcher.data.get('y'), 2)
      done()
    })
    watcher.data.set('x', 'bar')
  })
  it('should fire callback when map item is deleted', function (done) {
    let mappy = new Map()
    mappy.set('x', 'foo')
    mappy.set('y', 2)
    let watcher = mapObserver(mappy, () => {
      assert.equal(watcher.data.get('x'), undefined)
      assert.equal(watcher.data.get('y'), 2)
      done()
    })
    watcher.data.delete('x')
  })
  it('should pass a clone to the callback if the third argument is true', function (done) {
    let mappy = new Map()
    mappy.set('x', 'foo')
    mappy.set('y', 2)
    let watcher = mapObserver(mappy, (current, previous) => {
      assert.equal(current.get('x'), 'bar')
      assert.equal(current.get('y'), 2)
      assert.equal(previous.get('x'), 'foo')
      assert.equal(previous.get('y'), 2)
      done()
    }, true)
    watcher.data.set('x', 'bar')
  })
  it('should not fire if original array is later mutated', function (done) {
    let mappy = new Map()
    mappy.set('x', false)
    let watcher = mapObserver(mappy, (s) => {
      assert.equal(s.get('x'), true)
      done()
    })
    mappy.set('x', 'should fail')
    watcher.data.set('x', true)
  })
  it('should throw if non-map is passed as first param', function () {
    assert.throws(() => mapObserver(false), Error)
    assert.throws(() => mapObserver('foo'), Error)
    assert.throws(() => mapObserver([]), Error)
    assert.throws(() => mapObserver(new Set()), Error)
    assert.throws(() => mapObserver({}), Error)
  })
})
describe('mapObserver.subscribe', function () {
  it('should allow the subscription of multiple callbacks', function () {
    let subject = 0
    let watcher = mapObserver(new Map())
    watcher.subscribe(() => subject++)
    watcher.subscribe(() => subject = subject + 2)
    watcher.data.set('x', false)
    assert.equal(subject, 3)
  })
})
describe('mapObserver.unsubscribe', function () {
  it('should remove a callback on unsubscribe', function () {
    let subject = 0
    let watcher = mapObserver(new Map())
    const addOne = () => subject++
    const addTwo = () => subject = subject + 2
    watcher.subscribe(addOne)
    watcher.subscribe(addTwo)
    watcher.data.set('x', false)
    watcher.unsubscribe(addTwo)
    watcher.data.set('x', true)
    assert.equal(subject, 4)
  })
})
