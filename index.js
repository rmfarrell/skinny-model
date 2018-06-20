module.exports = function (value, update = function () { }, cache = false) {
  if (value.constructor.name === 'Boolean') return booleanStateManager(...arguments)
  if (value === Object(value)) return objectStateManager(...arguments)
  return primitiveStateManager(...arguments)
}


function objectStateManager(value = [], onUpdate = function () { }, cache = false) {
  return new Proxy(value, {
    set(targ, prop, v, r) {
      const old = (cache) ? _clone(r) : undefined
      targ[prop] = v
      onUpdate(targ, old)
      return true
    },
    deleteProperty(target, prop) {
      if (!prop in target) return
      const old = (cache) ? _clone(target) : undefined
      onUpdate(delete target[prop] && target, old)
    }
  });
}

function primitiveStateManager(value, onUpdate = function () { }, cache = false) {
  let _value = value
  return {
    get value() {
      return _value
    },
    set value(v) {
      if (_value === v) return
      const old = (cache) ? _value : undefined
      _value = v
      this.onUpdate(v, old)
    },
    onUpdate,
  }
}

function booleanStateManager(value = false, onUpdate = function () { }) {
  const self = simpleStateManager(...arguments)
  return Object.assign(self, {
    toggle() {
      self.update.call(this, self.value)
    },
  })
}

function numberStateManager(value = 0, onUpdate = function () { }, min = -Infinity, max = Infinity) {
  const self = primitiveStateManager(...arguments)
  return Object.assign(self, {
    increment(m = 1) {
      const targ = value = value + m;
      (targ <= max) && self.update.call(this, value)
    },
    decrement(m = 1) {
      const targ = value = value - m;
      (targ >= min) && self.update.call(this, value)
    },
  })
}

const stringStateManager = primitiveStateManager

function _clone(target) {
  const cn = target.constructor.name
  if (cn === 'Array') { return target.slice(0) }
  if (cn === 'Object') { return Object.assign({}, target) }
}
