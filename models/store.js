const mongoose = require('mongoose')
const slugify = require('slugify')

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: 'Please enter a store name'
    },
    slug: String,
    description: {
        type: String,
        trim: true
    },
    tags: [String]
})

storeSchema.pre('save', function(next) {
    this.slug = slugify(this.name)
    next()
})

module.exports = storeSchema