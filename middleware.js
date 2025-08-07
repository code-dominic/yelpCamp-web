const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');
const {campgroundSchema , reviewSchema} =require('./schemas')

module.exports.isLoggedIn = ( req , res ,next )=>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error' , 'You Have To Sign In');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req,res,next)=>{
    // console.log("1",req.session.returnTo);
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo;
    }
    console.log("2",res.locals.returnTo);
    next();
}

module.exports.isAuthor = async(req ,res ,next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error' , "YOU ARE NOT AUTHORISED TO DO THIS CHANGES");
        return res.redirect('/campgrounds');
    }
    next();
}

module.exports.validateCampground = (req ,res ,next)=>{
    
    const {error} = campgroundSchema.validate(req.body);
    // console.log(results);
    if(error){
        const msg =  error.details.map( el => el.message).join(',');
        throw new ExpressError( msg , 400);
    }
    next();
}

module.exports.validateReview = (req ,res ,next)=>{

    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg =  error.details.map( el => el.message).join(',');
        throw new ExpressError( msg , 400);
    }
    next();
}

module.exports.isReviewAuthor = async(req ,res ,next)=>{
    const { id , reviewID } = req.params;
    const review = await Review.findById(reviewID);
    if(!review.author.equals(req.user._id)){
        req.flash('error' , "YOU ARE NOT AUTHORISED TO DO THIS CHANGES");
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}