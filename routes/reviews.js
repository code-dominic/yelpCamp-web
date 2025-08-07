const express = require('express');
const router = express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const {campgroundSchema , reviewSchema} = require('../schemas.js');
const Review = require('../models/review');
const Campground = require('../models/campground');
const { validateReview, isLoggedIn ,isReviewAuthor } = require('../middleware.js')
const reviews = require('../controller/reviews.js')






router.post('/' ,validateReview, isLoggedIn , catchAsync(reviews.createReview))

router.delete('/:reviewID' , isLoggedIn , isReviewAuthor, catchAsync(reviews.deleteReview))


module.exports = router;