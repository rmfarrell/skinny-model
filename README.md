# Skinny Model
A lightweight easy-to-use observer for objects, arrays, maps, and primitives

### Syntax:
```
const myModel = new SkinnyModel(data, handler, returnPrevious);
```
The returned object includes three properties & methods:
- *data*: the data in its current state
- *subscribe* (function): add a new callback to be invoked when the data changes.
- *unsubscribe* (function): Remove a previously added subscription.

#### Parameters:
- *data* (Object | Map | Array | Number | String | Boolean): data model or single datum.
- *handler* (Function): a callback function invoked whenver the data is changed. This function passes back
the complete new data set, and the previous data set if the `returnPrevious` parameter was set to `true` in the constructor
 - *returnPrevious* (Boolean): if true, hander will return a copy of the previous data set. This defaults to false due to the performance cost of copying large objects.

## Examples

#### Object:
```
const myModel = SkinnyModel({
    name: "Ryan",
    occupation: "Developer",
    age: 205
  }, (data) => {
  
    // the new data is reflected in the callback
    console.log(data.age) // 206
  })

// increase my age
myModel.data.age = age++
```

#### Map:
```
const myMap = new Map()
myMap.set("x", true)
const myModel = SkinnyModel(myMap, (data) => {
  console.log(data.x) // false
})
myModel.data.set("x", false)
```

#### Array:
```
const myModel = SkinnyModel([0,1,2,3], (data) => {
  console.log(data) // [0,1,2]
})
myModel.data.pop()
```

#### Primitive
```
const myModel = SkinnyModel(false, (data) => {
  console.log(data) // 2
})
myModel.data = 2
```

#### Primitive
```
const myModel = SkinnyModel(false, (data) => {
  console.log(data) // 2
})
myModel.data = 2
```

#### Provide previous data state
```
// Make sure to pass `true` in the final parameter
const myModel = SkinnyModel({
    x: 1,
    y: 2
  }, (data, previous) => {
    console.log(data) // {x: 2, y: 2}
    console.log(previous) // {x: 1, y: 2}
  }, true)
myModel.data.x = 2
```

#### Add another callback later
Often, you'll want to pass an observer to a new scope. Or you may have a component in a disparate part of your code you want to notify of updates to the model. You can use the `subscribe` and `unsubsribe` to achieve this.
```
const myModel = SkinnyModel({x: 1}, (data) => {
  // Do some stuff
})

const doOtherStuff = () => { console.log("Call me, maybe") }

// Now doOtherStuff will be called when the model updates as well
myModel.subscribe(doOtherStuff)

// Nah, we're good.
myModel.unsubscribe(doOtherStuff)
```

## Object Proxy
Please note this library uses JS Proxy with some predefined traps for Objects and Arrays.
Proxy does not enjoy [universal support](https://caniuse.com/#feat=proxy) at the moment so you may need [a polyfill](https://github.com/GoogleChrome/proxy-polyfill) (Note that the polyfill also has several limitations).
