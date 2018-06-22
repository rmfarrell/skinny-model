// class MapFoo extends Map {
//   set(...args) {
//     console.log("set called");
//     return super.set(...args);
//   }
//   get(...args) {
//     console.log("get called");
//     return super.get(...args);
//   }
// }

/**
 * Watch the state of an Object value
 * Fire a callback when the the value is updated with the new and previous values 
 * passed in the callback param
 * @param {object|array|map} value 
 * @param {function} onUpdate 
 * @param {boolean} clone
 */
function objectWatcher(input = {}, onUpdate = function () { }, clone = false) {
  // validate value is an object
  if (input !== Object(input)) throw new Error(`${input} is not an Object.`)

  let out = { onUpdate }

  if (input.constructor.name === 'Map') {
    out.data = _mapWatcher(input, out.onUpdate, clone);
  } else {
    out.data = _objectWatcher(input, out.onUpdate, clone);
  }
  return out
}

function _objectWatcher(input = {}, onUpdate = function () { }, clone = false) {
  return new Proxy(input, {
    set(targ, prop, v, r) {
      const old = (clone) ? _clone(r) : undefined
      targ[prop] = v
      onUpdate(targ, old)
      return true
    },
    deleteProperty(target, prop) {
      if (!prop in target) return
      const old = (clone) ? _clone(target) : undefined
      onUpdate(delete target[prop] && target, old)
    }
  })
}

function _mapWatcher(input, onUpdate = function () { }, clone = false) {
  const mSet = input.set
  const mGet = input.get
  input.set = function (...args) {
    const old = (clone) ? _clone(r) : undefined
    mSet.apply(input, args);
    onUpdate(input, old)
    return true
  }
  input.get = function (...args) {
    return mGet.apply(input, args);
  }
  return new Proxy(input, {
    deleteProperty(target, prop) {
      if (!prop in target) return
      const old = (clone) ? _clone(target) : undefined
      onUpdate(delete target[prop] && target, old)
    }
  })
}

/**
 * Watch the state of a primitive value
 * Fire a callback when the the value is updated with the new and previous values 
 * passed in the callback param
 * @param {string|boolean|number} value 
 * @param {function} onUpdate
 * @return {PrimitiveWatcher}
 */
function primitiveWatcher(value, onUpdate = function () { }) {
  let _value = value
  return {
    get data() {
      return _value
    },
    set data(v) {
      if (_value === v) return
      const old = _value
      _value = v
      this.onUpdate(v, old)
    },
    onUpdate,
  }
}

/**
 * @typedef {object} PrimitiveWatcher
 * @property {getter/setter} value current value of the primitive
 * @property {function}
 */


// function booleanStateManager(value = false, onUpdate = function () { }) {
//   const self = simpleStateManager(...arguments)
//   return Object.assign(self, {
//     toggle() {
//       self.update.call(this, self.value)
//     },
//   })
// }

// function numberStateManager(value = 0, onUpdate = function () { }, min = -Infinity, max = Infinity) {
//   const self = primitiveStateManager(...arguments)
//   return Object.assign(self, {
//     increment(m = 1) {
//       const targ = value = value + m;
//       (targ <= max) && self.update.call(this, value)
//     },
//     decrement(m = 1) {
//       const targ = value = value - m;
//       (targ >= min) && self.update.call(this, value)
//     },
//   })
// }

// const stringStateManager = primitiveStateManager

function _clone(target) {
  const cn = target.constructor.name
  if (cn === 'Array') return target.slice(0)
  if (cn === 'Object') return Object.assign({}, target)
  if (cn === 'Map') {
    let out = new Map()
    for (var i in target) out[i] = target[i];
  }
}

module.exports = {
  primitiveWatcher,
  objectWatcher,
}