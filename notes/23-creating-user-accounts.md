# Video 23 - `Creating User Accounts`

In this video we will create login and register routes. Also, in register form will we see lots of validation that goes after user submits the data. Initial steps to register the routes is same like any other. We have to create a new controller file just for users. So lets call it `userController.js` inside `./controller` folder.

## Login and Regsiter routes

Now, first for login create a handler function called `userController.loginForm` and a view file called `login.pug`.

```js
exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};
```

`login.pug` file is nothing special it is just a view file with a `loginForm()` mixin inside of it.

Next, for register create a handler function called `userController.registerForm` and a view file called `register.pug`.

```js
exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};
```

## User model and Validations

Validations in software engineer is a process of checking the authencity of a type of any object through assertions.

When user register, it is very essential to check if data entered by the user is of correct type, form and most importantly is not malicious. Hence we have used many pre and post validations on register form. But before validating the regsiter request data we need to create a user schema and model.

Inside of models directory create a new file called `user.js`.

```js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validators = require('validators');

// I have used mongoose 5.4 that does not require promises to be set to global env.

const userSchema = new Schema({
  email: {
    type: String,
    required: 'You need to provide an email.',
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Inavlid email address']
  },
  name: {
    type: String,
    required: 'Must provide a name',
    trim: true
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
```

This is a simple userSchema model that we already know much about expcept `validate` field. Validate field takes an array, object or function and return a response in the form of error or just text. Validation here works on assertion, so basically a validate field checks if the value passes the validator function which in this case is `validator.isEmail`. If it fails it gives an error. [Further reading](https://mongoosejs.com/docs/validation.html)

Next, we are going to add few more things.

```js
...

const passportLocalMongoose = require('passport-local-mongoose');
const mongodbErrorHandler = require('mongoose-mongodb-errors');

...

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

```

`userSchema.plugin()` is a method to add plugins.

`passport-local-mongoose` is a mongoose plugin package that helps in user authentication with several methods like twitter, 0Auth, local etc. In our case we have just used to authenticate users via their email address and password. [Further reading](https://github.com/saintedlama/passport-local-mongoose)

`mongoose-mongodb-errors` this package simplify mongodb errors for us. It is easy to read errors thrown by this wrapper package.

## Form validation

Validation on the back-end is complete, now we will proceed with the form validation in `/register` router. After the data is sent by the user on `POST` route of `/register` we need to check and validate the `req.body` object containing data of user, we will do this by passing the data to a middleware. To begin first, register a post route.

```js
router.post('/register', catchErrors(userController.validateRegister));
```

Then we will create a validator middleware.

```js
exports.validateRegister = (req, res, next) => {
  req.checkBody('name', 'Name must be provided').notEmpty();
  req.checkBody('email', 'Email must be provided').notEmpty();
  req.sanitizeBody('name');
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req
    .checkBody('confirm-password', 'Confirm password should not be blank')
    .notEmpty();
  req
    .checkBody('confirm-password', 'Passwords do not match')
    .equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors.map(err => err.msg));
    res.render('register', {
      title: 'Register',
      body: req.body,
      flashes: req.flashes()
    });
  }
};
```

So this middle just read the `req.body` and validates all the field data. If it finds any error it flashes it to the user on `/register` route.

All the validators like `.checkBody()` and `.sanitizeBody()` is coming from `expressValidators` package in `app.js`. [Express validator docs](https://express-validator.github.io/docs/)
