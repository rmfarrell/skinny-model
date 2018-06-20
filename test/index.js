const assert = require('assert');
const svm = require('../index');

describe('SimpleViewModel', function () {
  describe('Primitive context', function () {
    it('should update when a new value is set', function () {
      let ss = svm('foo', (val) => {
        assert.equal(ss.value, 'bar')
      })
      ss.value = 'bar'
    });
    it('should not update when new value is unchanged', function (done) {
      let called = false
      let ss = svm('foo', (val) => {
        called = true;
      })
      ss.value = 'foo'
      setTimeout(() => {
        assert.equal(called, false)
        done()
      }, 200)
    });
    it('should pass new value in onUpdate function', function () {
      let ss = svm('foo', (val) => {
        assert.equal(val, 'bar')
      })
      ss.value = 'bar'
    });
    it('should pass old value in onUpdate function if 3rd argument == true', function () {
      let ss = svm('foo', (newValue, oldValue) => {
        assert.equal(oldValue, 'foo')
      }, true)
      ss.value = 'bar'
    });
    it('should not pass old value in onUpdate function if 3rd argument == false', function () {
      let ss = svm('foo', (newValue, oldValue) => {
        assert.equal(oldValue, undefined)
      }, false)
      ss.value = 'bar'
    });
    it('should allow assignment to onUpdate', () => {
      let ss = svm('foo')
      ss.onUpdate = (val) => {
        assert.equal(val, 'bar')
      }
      ss.value = 'bar'
    })
  });

  describe('Object context', function () {

  })
});