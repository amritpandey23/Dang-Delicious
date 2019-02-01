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

## Video 8 - `Middlewares`
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

## Video 10 - `Creating Mixin in Pug`
A *mixin* is a block of code that can be imported and used many times. In our project we have used mixin to create a store form that can be utilised on both `/add` and `/edit` routes. Mixins in pug can be created and imported as follows:

`./views/mixin/_storeForm.pug`
```pug
mixin storeForm(store = {})
    form(action="/route" method="POST")
        input(placeholder="Enter store name")
        input(placeholder="Enter store type")
        input(type="submit")
```

`./views/editStore.pug`
```pug
extends layout
include mixin/_storeForm

content block
    h1 This is simple form
    +storeForm()
```

**NOTE**: In the video, we have seen web using `POST` method on the form. To get data via the POST form we have to create extra route to handle it. To get post data, use `.post()` method on the routes.
```js
app.post('/add', (req, res) => {})
```

## Video 11 - `Saving data to database`
Until now what mongoose did was connecting to the database in `start.js` file, and load all the models imported, in our case, from `models/store.js` file. Now we will use this pre configured setup to commit and save our data to the database.

*Step 1*: After the json data is recieved via the POST route of `/add`, we will use the request object to save it in the database.

*Step 2*: Import `Mongoose` module and the `Store` model

`./controllers/storeController.js`
```js
const mongoose = require('mongoose')
const Store = mongoose.model('Store')
```

*Step 3*: Inside of the addStore handle create a store model object and pass in `req.body`.
```js
...
export.addStore = (req, res) => {
    const store = new Store(req.body)
}
```
`req.body` contains the data in json format that was sent from the form in `/add` route. Since this object already comply with the datatype of each property we can use this as a whole to create the store object.

*Step 4*: Now we have to save the data in the database. The `store` object will by default have a `.save()` method that will commit the data to the database, however it will return a promise, which needs to be resolved. This can be done conventionally with `then()` and `.catch()`:
```js
store.save(req.body)
    .then(() => {
        console.log('Data saved successfully!')
    })
    .catch(err => {
        console.error(err)
    })
```
But we can also use [Async/Await](https://javascript.info/async-await) which is easier to resolve promises.
```js
export.addStore = async (req, res) => {
    const store = new Store(req.body)
    await store.save()
    console.log('Datasaved successfully')
    res.redirect('/')
}
```

## Video 12 - `Flash messages`
On a successful task completion like saving data to database, the end-user is given a confirmation visually in a form of flashing message on the screen. In our app, whenever the data is collected from the form and stored, the flash message appear on home route giving a confirmation. We have used `connect-flash` package to handle this functionality. Working of flash messages is simple, whatever messages needs to flashed is stored with its category and message in a global object. This object is read everytime when pages render. If some messsages exist in the object it is displayed to the end-user.

To create flash messages just use following code inside the route:
```js
req.flash('Success', 'This is a success message')
```
`req.flash()` will add a new key, value pair to the `locals.flashes` object. This object is accessible in the `layout.pug` file. Pug can then read all the messages and render them in a nice element.

`./controllers/storeController.js`
```js
exports.createStore = async (req, res) => {
    const store = await (new Store(req.body)).save()
    req.flash('success', `Sucessfully saved ${req.body.name} to the database`)
    res.redirect('/')
}