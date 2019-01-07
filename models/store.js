const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const slug = require('slugs')

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

module.exports = mongoose.model('Store', storeSchema)