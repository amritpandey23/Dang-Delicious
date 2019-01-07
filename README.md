## Making Data Models - `Video 9`
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