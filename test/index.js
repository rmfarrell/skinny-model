const assert = require('assert');
const { primitiveWatcher, objectWatcher } = require('../index');


describe('primitiveWatcher', function () {
  it('should update when a new value is set', function (done) {
    let watcher = primitiveWatcher('foo', (val) => {
      assert.equal(watcher.data, 'bar')
      done()
    })
    watcher.data = 'bar'
  });
  it('should pass new value in onUpdate function', function (done) {
    let watcher = primitiveWatcher('foo', (val) => {
      assert.equal(val, 'bar')
      done()
    })
    watcher.data = 'bar'
  });
  it('should pass old value in onUpdate function if 3rd argument == true', function (done) {
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
      let watcher = objectWatcher({ x: 1 }, () => {
        assert.equal(watcher.data.x, 2)
        done()
      })
      watcher.data.x = 2
    })
  })
  context('Map', function () {
    it('should fire callback when data is updated', function (done) {
      let mappy = new Map()
      mappy.set('x', 'foo')
      mappy.set('y', 2)
      let watcher = objectWatcher(mappy, () => {
        assert.equal(watcher.data.get('x'), 'bar')
        assert.equal(watcher.data.get('y'), 2)
        done()
      })
      watcher.data.set('x', 'bar')
    });
  })
  // context('Array', function () {
  //   it('should fire callback when data is updated', function () {
  //     let watcher = objectWatcher([1, 2, 3], () => {
  //       assert.equal(watcher.data.get('x'), 'bar')
  //     })
  //     watcher.data.set('x', 'bar')
  //   });
  // })
})