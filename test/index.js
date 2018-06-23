const assert = require('assert');
const { primitiveWatcher, objectWatcher, mapWatcher } = require('../index');


describe('primitiveWatcher', function () {
  it('should update when a new value is set', function (done) {
    let watcher = primitiveWatcher('foo', (val) => {
      assert.equal(watcher.data, 'bar')
      assert.equal(val, 'bar')
      done()
    })
    watcher.data = 'bar'
  });
  it('should pass old value in onUpdate', function (done) {
    let watcher = primitiveWatcher('foo', (newValue, oldValue) => {
      assert.equal(oldValue, 'foo')
      done()
    }, true)
    watcher.data = 'bar'
  });
  it('should allow reassignment to onUpdate', (done) => {
    let watcher = primitiveWatcher('foo')
    watcher.onUpdate = (val) => {
      assert.equal(val, 'bar')
      done()
    }
    watcher.data = 'bar'
  })
});

describe('objectWatcher', function () {
  context('Not an object', function () {
    it('should throw an error if a non-object is passed as first argument', function () {
      assert.throws(() => objectWatcher(false), Error, 'false is not an object');
    })
  })
  context('Object literal', function () {
    it('should fire callback when data is updated', function (done) {
      let watcher = objectWatcher({ x: 1 }, ({ x }) => {
        assert.equal(watcher.data.x, 2)
        assert.equal(x, 2)
        done()
      })
      watcher.data.x = 2
    })
  })

  context('Array', function () {
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
    it('should fire callback when data is updated', function (done) {
      let counter = 0
      let watcher = objectWatcher([1, 2, 3], (val) => {
        assert.deepEqual(watcher.data, expected[counter])
        assert.deepEqual(val, expected[counter])
        if (counter >= expected.length - 1) return done()
        counter++
      })
      watcher.data.pop()
      watcher.data.push('foo')
      watcher.data[2] = 'bar'
      watcher.data[5] = 5
      watcher.data[5] = undefined
    });
  })
})
describe('mapWatcher', function () {
  it('should fire callback when data is updated', function (done) {
    let mappy = new Map()
    mappy.set('x', 'foo')
    mappy.set('y', 2)
    let watcher = mapWatcher(mappy, () => {
      assert.equal(watcher.data.get('x'), 'bar')
      assert.equal(watcher.data.get('y'), 2)
      done()
    })
    watcher.data.set('x', 'bar')
  });
  it('should fire callback when map item is deleted', function (done) {
    let mappy = new Map()
    mappy.set('x', 'foo')
    mappy.set('y', 2)
    let watcher = mapWatcher(mappy, () => {
      assert.equal(watcher.data.get('x'), undefined)
      assert.equal(watcher.data.get('y'), 2)
      done()
    })
    watcher.data.delete('x')
  });

  it('should pass a clone to the callback if the third argument is true', function (done) {
    let mappy = new Map()
    mappy.set('x', 'foo')
    mappy.set('y', 2)
    let watcher = mapWatcher(mappy, (current, previous) => {
      assert.equal(current.get('x'), 'bar')
      assert.equal(current.get('y'), 2)
      assert.equal(previous.get('x'), 'foo')
      assert.equal(previous.get('y'), 2)
      done()
    }, true)
    watcher.data.set('x', 'bar')
  })
})