const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const {campgroundSchema , reviewSchema} = require('../schemas.js');
const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const campgrounds = require('../controller/campground.js')
const { storage } = require('../cloudinary/index.js')
const multer  = require('multer')
const upload = multer({ storage})

const {isLoggedIn, storeReturnTo , isAuthor ,validateCampground} = require('../middleware.js');

router.route('/')
    .get( campgrounds.index )
    .post( isLoggedIn  , upload.array('image') , validateCampground ,catchAsync(campgrounds.createCampground));


router.get('/new' , isLoggedIn , campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn , isAuthor , upload.array('image') ,  validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn ,isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit' , isLoggedIn , isAuthor , catchAsync(campgrounds.renderEditForm))

module.exports = router;