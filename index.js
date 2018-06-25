/**
 * Router function for all watcher types
 * @param {*} input 
 * @param {*} onUpdate 
 * @param {*} clone 
 */
function watcher(input = {}, onUpdate = function () { }, clone = false) {

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
  if (_isObject(value)) throw new Error(`${value} is not a primitive value.`)
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
 * Watch the state of an Object literal
 * Fire a callback when the the value is updated with the new and previous values 
 * passed in the callback param
 * @param {array} value 
 * @param {function} onUpdate
 * @param {boolean} clone
 * @return {ObjectWatcher}
 */
function objectWatcher(input = {}, onUpdate = function () { }, clone = false) {
  if (input.constructor.name !== 'Object') {
    throw new Error(`Expected Object literal. Recieved ${input.constructor.name}`)
  }
  const callbackCollection = _CallbackCollection([onUpdate])
  const data = new Proxy(input, {
    set(targ, prop, v) {
      old = __clone(targ)
      targ[prop] = v
      callbackCollection.run(targ, old)
      return true
    },
    deleteProperty(targ, prop) {
      if (!prop in targ) return
      old = __clone(targ)
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

  function __clone(obj) {
    return (clone) ? Object.assign({}, obj) : undefined
  }
}

/**
 * Watch the state of an Array
 * Fire a callback when the the value is updated with the new and previous values 
 * passed in the callback param
 * @param {array} value 
 * @param {function} onUpdate 
 * @param {boolean} clone
 * @return {ObjectWatcher}
 */
function arrayWatcher(input = {}, onUpdate = function () { }, clone = false) {
  if (input.constructor.name !== 'Array') {
    throw new Error(`Expected Array. Recieved ${input.constructor.name}`)
  }
  const callbackCollection = _CallbackCollection([onUpdate])
  const data = new Proxy(input, {
    set(targ, prop, v) {
      const old = __clone(targ)
      targ[prop] = v
      callbackCollection.run(targ, old)
      return true
    }
  })
  return {
    data,
    subscribe: (func) => callbackCollection.add(func),
    unsubscribe: (func) => callbackCollection.remove(func),
  }

  function __clone(target) {
    return (clone) ? target.slice(0) : undefined
  }
}

/**
 * Watch the state of a map
 * Fire a callback when the the value is updated with the new and previous values 
 * passed in the callback param
 * @param {array} value 
 * @param {function} onUpdate
 * @param {boolean} clone
 * @return {ObjectWatcher}
 */
function mapWatcher(input, onUpdate = function () { }, clone = false) {
  const callbackCollection = _CallbackCollection([onUpdate])
  const data = __clone(input)
  const _set = input.set
  const _delete = input.delete
  data.set = function (...args) {
    const old = (clone) ? __clone(data) : undefined
    _set.apply(data, args)
    callbackCollection.run(data, old)
    return true
  }
  data.delete = function (...args) {
    if (!data.get(args[0])) return
    const old = (clone) ? __clone(data) : undefined
    _delete.apply(data, args);
    callbackCollection.run(data, old)
    return true
  }
  return {
    data,
    subscribe: (func) => callbackCollection.add(func),
    unsubscribe: (func) => callbackCollection.remove(func),
  }

  function __clone(m) {
    let out = new Map()
    m.forEach((v, k) => out.set(k, v))
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

// validate a type against an array of constructor names; 
// throw error if it does not conform
function _validateType(obj, cns = []) {
  if (cn.constructor.name.indexOf(foo) > -1) {
    throw new Error(`Expected ${cn}. Recieved ${obj.constructor.name}`)
  }
  return true
}

// Check whether input is object
function _isObject(obj) {
  return (Object(obj) === obj)
}

module.exports = {
  primitiveWatcher,
  objectWatcher,
  mapWatcher,
  arrayWatcher,
}

/**
 * @typedef {object} ObjectWatcher
 * @property {map|object|array} data
 * @property {function} subscribe
 * @property {function} unsubscribe
 */

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