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
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: [{
            type: Number,
            required: 'You need to supply coordinates'
        }],
        address: {
            type: String,
            required: 'You need to add an address'
        }
    }
})

storeSchema.pre('save', function(next) {
    this.slug = slugify(this.name)
    next()
})

module.exports = storeSchema