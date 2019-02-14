const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
// Multer config options
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true);
    } else {
      next({
        message: 'That file type is not allowed.'
      });
    }
  }
};
// Handle Home route
exports.homePage = (req, res) => {
  res.render('index');
};
// Handle `/add` route
exports.addStore = (req, res) => {
  res.render('editStore', {
    title: 'Add Stores'
  });
};
/**
 * Routes below are used for Creating, Saving, uploading
 * and uploading data to the database via form.
 */

// Multer middleware to handle image upload
exports.upload = multer(multerOptions).single('photo');
exports.resize = async (req, res, next) => {
  if (!req.file) return next();
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  const photoBuffer = req.file.buffer;
  const photo = await jimp.read(photoBuffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  return next();
};
// Handle create store for first time.
exports.createStore = async (req, res) => {
  const store = await new Store(req.body).save();
  req.flash('success', `Sucessfully saved ${req.body.name} to the database`);
  res.redirect('/stores');
};
// Handle editing already saved store data.
exports.editStore = async (req, res) => {
  // 1. Find store by its id.
  // 2. send data to the editStore page template
  const storeId = req.params.id;
  const store = await Store.findOne({
    _id: storeId
  });
  res.render('editStore', {
    title: `Edit ${store.name}`,
    store
  });
};
// Saving store data after editing.
exports.updateStore = async (req, res) => {
  req.body.location.type = 'Point';
  // 1. update the store details sent via POST request
  const toUpdateData = req.body;
  const storeId = req.params.id;
  const store = await Store.findOneAndUpdate(
    {
      _id: storeId
    },
    toUpdateData,
    {
      new: true, // return the new data instead of new one
      runValidators: true // validate the data to check types and other things.
    }
  );
  req.flash(
    'success',
    `Details for ${store.name} is update. <a href="/stores/${
      store.slug
    }">View Store</a>`
  );
  res.redirect(`/stores/${store._id}/edit`);
};
// Display stores saved in database
exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('getStores', {
    title: 'Stores',
    stores
  });
};

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({
    slug: req.params.slug
  });
  if (!store.slug) return next();
  res.render('store', {
    store,
    title: store.name
  });
};

exports.getStoreByTags = async (req, res) => {
  const tags = await Store.getTagsList();
  const tag = req.params.tag;
  res.render('tag', { tags, title: `Tags ${tag && `|  ${tag}`}` });
};
