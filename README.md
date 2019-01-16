## Video 6 - `Template Helpers`
The notion of template helpers is to provide the javascript functions in pug template. We can not only provide functions but objects and modules as well. So, for example, if we want `lodash` module fucntions in our template, we could just export it through a file and set `res.locals` to direct to that file.

`helpers.js`
```js
const lodash = require('lodash');
const moment = require('moment');

exports.lodash = lodash;
exports.moment = moment;
```

`app.js`
```js
const helpers = require('./helpers')
// Use a middleware to set the locals
app.use((req, res, next) => {
    res.locals.h = helpers
})
```
Crucial point to note here is that, we have used `res.locals` but we could have all used `app.locals`. The main difference in using app is that anything in app.local will set the property of the app gloablly and it can be accessible everywhere.

`index.pug`
```pug
h2 The sum of 2 and 3 is #{h.lodash.add(2, 3)}
```

## Video 9 - `Making Data Models`
In video 9 we discussed about creating store models that we'll use to create `stores` and save them in database(mongoDB). This is just a simple code on how to create models(object to store data before adding them in database). Two things are required for this, one is `schema` and other is `model`, both of these will be available via mongoose module. I believe `schema` is like blue-print of our model but exactly why do we use a schema when we can pass structure of our model as an argument? **I don't know right now, more on this later**.

```js
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: "Please pass a name of the store"
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String]
})

storeSchema.pre('save', next => {
    if (!this.isModified('name')) return next()
    this.slug = slug(this.name)
    return next()
})

const storeModel = mongoose.model('Store', storeSchema)
```
Let's just see what we have:
1. `mongoose`: pretty self explanatory.
2. `new mongoose.Schema({})`: So this class returns a *schema object* and takes the structure of store model as an argument. Each key in the argument object is the name of property the store will have, and its value consists of meta data on what kind of datatype and literals it will accept.
3. `storeSchema.pre()`: So apprantly the schema also have some functions in it. This `pre` function fires up before the data is committed to the database, *save* is an event, likewise there'll be more. Specifically this function just take the slug field value entered by the user and pass it into `slug` function. Don't care about `slug()` right now.
4. `mongoose.model('Store', storeSchema)`: Finally, we were working for this. This creates an model named `Store` that will be used to store data before getting commited to the database. Think of it like clothes for user's data. The data(person) will go to the party(database) after getting dressed(Store model).
5. `mongoose.Promise = global.Promise`: This sets the Promise of mongoose modules to that environment where it is running. I do not understand the use of it.

> Life was simple with SQL 😌

# Video 8 - `Middlewares`
Everything in express is achieved via middlewares. On each load of the app, middleware runs itself if it is passed into the app. For example, if there is an image dump site that only accepts .jpg or .png formats, a middleware can be placed in the app before submitting the image that checks format of the image. Everything that makes express special are middlewares. Routes are special kind of middlewares that reacts to the URL and perform tasks.

To create middleware for routes first define the middleware and then pass it into routes:

`myMiddleWareStoreHouse.js`
```js
const middleWare1 = (req, res, next) => {
    req.name = "Amrit"
    next()
}
const middleWare2 = (req, res, next) => {
    console.log(`Middleware1 was loaded and the name entered was ${req.name}`)
    next()
}

exports.middleWare1 = middleWare1
exports.middleWare2 = middleWare2
```

`routes/index.js`
```js
const middleWareStore = require('./myMiddleWareStoreHouse')
const router = require('express').Router()

router.use(
    '/',
    middleWareStore.middleWare1,
    middleWareStore.middleWare2,
    (req, res) => {
        res.send(`The name requested by middleware was ${req.name}`)
    }
)
```
As we can see the middleware are sent in a sequence. **next** is function that passes the return of any middle onto the next middle ware. If next is not called, the app will get paused at the same middle ware keep listening to it.