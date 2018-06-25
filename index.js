/**
 * Watch the state of a primitive value
 * Fire a callback when the the value is updated with the new and previous values 
 * passed in the callback param
 * @param {string|boolean|number} value 
 * @param {function} onUpdate
 * @return {PrimitiveWatcher}
 */
function primitiveWatcher(value, onUpdate = function () { }) {
  const callbackCollection = _CallbackCollection([onUpdate])
  let _value = value
  return {
    get data() {
      return _value
    },
    set data(v) {
      if (_value === v) return
      const old = _value
      _value = v
      callbackCollection.run(v, old)
    },
    subscribe: (func) => callbackCollection.add(func),
    unsubscribe: (func) => callbackCollection.remove(func),
  }
}

/**
 * Watch the state of an Object value
 * Fire a callback when the the value is updated with the new and previous values 
 * passed in the callback param
 * @param {object|array|map} value 
 * @param {function} onUpdate 
 * @param {boolean} clone
 */
function objectWatcher(input = {}, onUpdate = function () { }, clone = false) {
  const callbackCollection = _CallbackCollection([onUpdate])
  const data = new Proxy(input, {
    set(targ, prop, v) {
      old = _clone(targ)
      targ[prop] = v
      callbackCollection.run(targ, old)
      return true
    },
    deleteProperty(targ, prop) {
      if (!prop in targ) return
      old = _clone(targ)
      delete targ[prop]
      callbackCollection.run(targ, old)
      return true
    }
  })
  return {
    data,
    subscribe: (func) => callbackCollection.add(func),
    unsubscribe: (func) => callbackCollection.remove(func),
  }

  function _clone(obj) {
    return (clone) ? Object.assign({}, obj) : undefined
  }
}

function _publish(subs = [], ...args) {
  subs.forEach((func) => {
    func(...args)
  })
}

function _subscribe(functionsArray, func) {
  if (typeof func !== 'function') {
    throw new Error(`
      appendCallback must pass function as first argument. Recieved ${func}`)
  }
  functionsArray.push(func)
}

function arrayWatcher(input = {}, onUpdate = function () { }, clone = false) {
  let out = { onUpdate }
  out.data = new Proxy(input, {
    set(targ, prop, v) {
      const old = (clone) ? _clone(targ) : undefined
      targ[prop] = v
      out.onUpdate(targ, old)
      return true
    }
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

// TODO delete
// separate function
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

/**
 * Manage a set of callbacks with add/remove methods
 * Run method runs each passing through the arguments
 * @param {Array} funcs array of functions
 * @return {CallbackCollection}
 */
function _CallbackCollection(funcs = []) {
  function add(func) {
    validateIsFunc(func)
    funcs.push(func)
  }
  function remove(func) {
    validateIsFunc(func)
    const funcIdx = funcs.indexOf(func)
    if (funcIdx > -1) {
      funcs.splice(funcIdx, 1);
    }
  }
  function validateIsFunc(func) {
    if (typeof func !== 'function') {
      throw new Error(`Type error. Expected function. Received ${func}`)
    }
  }
  function run(...args) {
    funcs.forEach(f => f(...args))
  }

  return {
    add,
    remove,
    run,
  }
}

module.exports = {
  primitiveWatcher,
  objectWatcher,
  mapWatcher,
  arrayWatcher,
}

/**
 * @typedef {object} PrimitiveWatcher
 * @property {getter/setter} value current value of the primitive
 * @property {function}
 */

 /**
 * @typedef {object} CallbackCollection
 * @property {function} add add a function to a collection
 * @property {function} remove remove a function to a collection
 * @property {function} run run each function passing arguments through unchanged
 */