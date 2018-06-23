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
  const cn = input.constructor.name
  if (cn !== 'Object' && cn !== 'Array') throw new Error(`Expected an Object or Array. Received ${input}`)
  let out = { onUpdate }
  out.data = new Proxy(input, {
    set(targ, prop, v, r) {
      const old = (clone) ? _clone(r) : undefined
      targ[prop] = v
      onUpdate(targ, old)
      return true
    }
    // deleteProperty(target, prop) {
    //   if (!prop in target) return
    //   const old = (clone) ? _clone(target) : undefined
    //   onUpdate(delete target[prop] && target, old)
    // }
  })
  return out
}

function mapWatcher(input, onUpdate = function () { }, clone = false) {
  const data = _clone(input)
  const _set = input.set
  const _delete = input.delete
  let out = { onUpdate, data }
  out.data.set = function (...args) {
    const old = (clone) ? _clone(data) : undefined
    _set.apply(data, args);
    out.onUpdate(data, old)
    return true
  }
  out.data.delete = function (...args) {
    if (!data.get(args[0])) return
    const old = (clone) ? _clone(data) : undefined
    _delete.apply(data, args);
    out.onUpdate(data, old)
    return true
  }
  return out
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

// todo separate function
function _clone(target) {
  const cn = target.constructor.name
  if (cn === 'Array') return target.slice(0)
  if (cn === 'Object') return Object.assign({}, target)
  if (cn === 'Map') {
    let out = new Map()
    target.forEach((v, k) => out.set(k, v))
    return out
  }
}

module.exports = {
  primitiveWatcher,
  objectWatcher,
  mapWatcher,
}

/**
 * @typedef {object} PrimitiveWatcher
 * @property {getter/setter} value current value of the primitive
 * @property {function}
 */