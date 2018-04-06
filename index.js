module.exports = function (value = null, update = function () { }, min, max) {
  const cn = value.constructor.name
  switch (cn) {
    case 'Boolean':
      return booleanStateManager(...arguments)
    case 'String':
      return simpleStateManager(...arguments)
    case 'Number':
      return numberStateManager(...arguments)
    case 'Array':
      return objectStateManager(...arguments)
    case 'Object':
      return objectStateManager(...arguments)
    default:
      throw `Unrecognized type. Must be one of Boolean, String, Array, or Object. 
        Received ${cn}`
  }
}


function objectStateManager(value = [], onUpdate = function () { }) {
  return new Proxy(value, {
    set(targ, prop, v, r) {
      const _old = _clone(r)
      targ[prop] = v
      onUpdate(targ, _old)
      return true
    },
    deleteProperty(target, prop) {
      if (!prop in target) return
      this.old = _clone(target)
      onUpdate(delete target[prop] && target, this.old)
    }
  });
}

function simpleStateManager(value, onUpdate = function () { }) {
  let _value = value
  return {
    value: _value,
    update: function (v) {
      if (v === _value) return
      onUpdate(v, _value)
      _value = v
    }
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
  const self = simpleStateManager(...arguments)
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

const stringStateManager = simpleStateManager

function _clone(target) {
  const cn = target.constructor.name
  if (cn === 'Array') { return target.slice(0) }
  if (cn === 'Object') { return Object.assign({}, target) }
}
