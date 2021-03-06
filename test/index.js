const assert = require('assert');
const SkinnyModel = require('../index');

// -- Primitive Observer

describe('SkinnyModel', function () {
  // It should throw type error

  // -- Primitives
  context('primitive', function () {

    it('should update when a new value is set', function (done) {
      let watcher = SkinnyModel('foo', (val) => {
        assert.equal(watcher.data, 'bar')
        assert.equal(val, 'bar')
        done()
      })
      watcher.data = 'bar'
    });
    it('should pass old value in onUpdate', function (done) {
      let watcher = SkinnyModel('foo', (newValue, oldValue) => {
        assert.equal(oldValue, 'foo')
        done()
      }, true)
      watcher.data = 'bar'
    })
    it('should not fire if original value is later mutated', (done) => {
      let subject = false
      let watcher = SkinnyModel(subject, (val) => {
        assert.equal(val, true)
        done()
      })
      subject = 'should fail'
      watcher.data = true
    })
  })

  // -- Objects
  context('Object', function () {
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
      let watcher = SkinnyModel({ x: 1 }, (data) => {
        assert.deepEqual(data, expected[counter])
        assert.deepEqual(watcher.data, expected[counter])
        if (counter + 1 < expected.length) return counter++;
        done()
      })
      runMutations(watcher)
    })
    it('should pass clone of old data if third argument is true', function (done) {
      let counter = 0
      let watcher = SkinnyModel({ x: 1 }, (_, oldValue) => {
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
      let watcher = SkinnyModel(subject, ({ x }) => {
        assert.equal(x, true)
        done()
      })
      subject.x = 'should fail'
      watcher.data.x = true
    })
  })

  // -- Arrays
  context('Array', function () {
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
      let watcher = SkinnyModel([1, 2, 3], (val) => {
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
      let watcher = SkinnyModel([1, 2, 3], (newValue, oldValue) => {
        assert.deepEqual(oldValue, [1, 2, 3])
        assert.deepEqual(newValue, ['bar', 2, 3])
        done()
      }, true)
      watcher.data[0] = 'bar'
    })
    it('should not fire if original array is later mutated', function (done) {
      let subject = [false, false]
      let watcher = SkinnyModel(subject, (s) => {
        assert.equal(s[0], true)
        done()
      })
      subject[0] = 'should fail'
      watcher.data[0] = true
    })
  })

  // -- Maps
  context('Maps', function () {
    it('should fire callback when data is updated', function (done) {
      let mappy = new Map()
      mappy.set('x', 'foo')
      mappy.set('y', 2)
      let watcher = SkinnyModel(mappy, () => {
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
      let watcher = SkinnyModel(mappy, () => {
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
      let watcher = SkinnyModel(mappy, (current, previous) => {
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
      let watcher = SkinnyModel(mappy, (s) => {
        assert.equal(s.get('x'), true)
        done()
      })
      mappy.set('x', 'should fail')
      watcher.data.set('x', true)
    })
  })
})
describe('SkinnyModel.subscribe', function () {
  it('should allow the subscription of multiple callbacks', function () {
    let subject = 0
    let watcher = SkinnyModel(false)
    watcher.subscribe(() => { subject++ })
    watcher.subscribe(() => { subject = subject + 2 })
    watcher.data = true
    assert.equal(subject, 3)
  })
})
describe('SkinnyModel.unsubscribe', function () {
  it('should remove a callback on unsubscribe', function () {
    let subject = 0
    let watcher = SkinnyModel(false)
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
