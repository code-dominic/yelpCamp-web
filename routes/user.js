const express = require('express');
const router = express.Router();
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const { renderLoginForm, createNewUser } = require('../controller/users');
const users = require('../controller/users')

router.route('/register')
    .get(storeReturnTo, users.renderRegisterForm)
    .post( catchAsync(users.createNewUser));

router.route('/login')
    .get(users.renderLoginForm)
    .post(storeReturnTo , passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }) , users.login);


router.get( '/logout' , users.logout)

module.exports = router;