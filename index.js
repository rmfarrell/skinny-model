/**
 * Watch the state of an Object value
 * Fire a callback when the the value is updated with the new and previous values 
 * passed in the callback param
 * @param {object|array|map} value 
 * @param {function} onUpdate 
 * @param {boolean} clone
 */
function objectWatcher(value = [], onUpdate = function () { }, clone = false) {
  // if (value === Object(value)) return objectStateManager(...arguments)
  return {
    data: new Proxy(value, {
      set(targ, prop, v, r) {
        const old = (clone) ? _clone(r) : undefined
        targ[prop] = v
        this.onUpdate(targ, old)
        return true
      },
      deleteProperty(target, prop) {
        if (!prop in target) return
        const old = (clone) ? _clone(target) : undefined
        this.onUpdate(delete target[prop] && target, old)
      }
    }),
    onUpdate,
  }
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
  if (cn === 'Array') { return target.slice(0) }
  if (cn === 'Object') { return Object.assign({}, target) }
  // TODO clone Map
}

module.exports = {
  primitiveWatcher,
  objectWatcher,
}