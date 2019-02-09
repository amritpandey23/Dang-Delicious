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
    },
    photo: String
});

storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) return next();
  this.slug = slugify(this.name);
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?$)`, 'i');
  const storeWithSlug = await this.constructor.find({slug: slugRegEx});
  if (storeWithSlug.length) {
    this.slug = `${this.slug}-${storeWithSlug.length + 1}`;
  }
  next();
});

storeSchema.pre('save', function(next) {
    this.slug = slugify(this.name)
    next()
})

module.exports = storeSchema