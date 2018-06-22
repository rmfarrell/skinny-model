const assert = require('assert');
const { primitiveWatcher, objectWatcher } = require('../index');

// When first param is a JS primitive
describe('primitiveWatcher', function () {
  it('should update when a new value is set', function () {
    let watcher = primitiveWatcher('foo', (val) => {
      assert.equal(watcher.data, 'bar')
    })
    watcher.data = 'bar'
  });
  it('should not update when new value is unchanged', function (done) {
    let called = false
    let watcher = primitiveWatcher('foo', (val) => {
      called = true;
    })
    watcher.data = 'foo'
    setTimeout(() => {
      assert.equal(called, false)
      done()
    }, 200)
  });
  it('should pass new value in onUpdate function', function () {
    let watcher = primitiveWatcher('foo', (val) => {
      assert.equal(val, 'bar')
    })
    watcher.data = 'bar'
  });
  it('should pass old value in onUpdate function if 3rd argument == true', function () {
    let watcher = primitiveWatcher('foo', (newValue, oldValue) => {
      assert.equal(oldValue, 'foo')
    }, true)
    watcher.data = 'bar'
  });
  it('should allow reassignment to onUpdate', () => {
    let watcher = primitiveWatcher('foo')
    watcher.onUpdate = (val) => {
      assert.equal(val, 'bar')
    }
    watcher.data = 'bar'
  })
});

// When first param is a JS primitive
describe('objectWatcher', function () {
  it('should ')
})