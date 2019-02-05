const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const multer = require('multer')

const multerOptions = {
    storage: multer.memoryStorage(),
    fileFilter: function(req, file, next) {
        const isPhoto = file.mimeType.startsWith('/image')
        if (isPhoto) {
            next(null, true)
        } else {
            next({ message: 'That file type is not allowed.' })
        }
    }
}

exports.homePage = (req, res) => {
    res.render('index')
}

exports.addStore = (req, res) => {
    res.render('editStore', { title: 'Add Stores' })
}

exports.upload = multer(multerOptions).single('photo')

exports.createStore = async (req, res) => {
    const store = await (new Store(req.body)).save()
    req.flash('success', `Sucessfully saved ${req.body.name} to the database`)
    res.redirect('/stores')
}

exports.getStores = async (req, res) => {
    const stores = await Store.find()
    res.render('getStores', {
        title: 'Stores',
        stores
    })
}

exports.editStore = async (req, res) => {
    // 1. Find store by its id.
    // 2. send data to the editStore page template
    const storeId = req.params.id
    const store = await Store.findOne({ _id: storeId })
    res.render('editStore', { title: `Edit ${store.name}`, store })
}

exports.updateStore = async (req, res) => {
    req.body.location.type = 'Point'
    // 1. update the store details sent via POST request
    const toUpdateData = req.body
    const storeId = req.params.id
    const store = await Store.findOneAndUpdate({ _id: storeId }, toUpdateData, {
        new: true, // return the new data instead of new one
        runValidators: true // validate the data to check types and other things.
    }).exec()
    req.flash('success', `Details for ${store.name} is update. <a href="/stores/${store.slug}">View Store</a>`)
    res.redirect(`/stores/${store._id}/edit`)
}