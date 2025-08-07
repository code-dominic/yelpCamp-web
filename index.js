if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
// console.log(process.env.SECRET);

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError')
const catchAsync = require('./utils/catchAsync');
const helmet = require('helmet');

const flash = require('connect-flash')
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js')

const campgroundRouter =require('./routes/campground')
const reviewsRouter = require('./routes/reviews')
const userRouter = require('./routes/user')
const expressMongoSanitize = require('express-mongo-sanitize');

const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL;
// mongodb://127.0.0.1:27017/yelp-camp
mongoose.connect(dbUrl)
    .then( data=>{
        console.log('mongodb connected!!');
    })
    .catch( err=>{
        console.log('connection failed');
        console.log(err);
    })


app.engine('ejs' , ejsMate);
app.set('view engine' , 'ejs');
app.set('views' , path.join(__dirname , 'views'));
app.set('trust proxy', 1) // trust first proxy
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));
app.use(helmet({contentSecurityPolicy : false}));

app.use(express.static(path.join(__dirname , 'public')));
app.use(expressMongoSanitize());


const store = new MongoStore({
    mongoUrl: dbUrl,

    secret : 'thisShouldBeABetterSecret',
    touchAfter : 24*60*60

})

store.on("error" , function(e){
    console.log("session strore error",e);
})

const sessionConfig ={
    store,
    name : 'session',
    secret : 'thisShouldBeABetterSecret',
    resave : false,
    saveUninitialized : true,
    cookie:{
        httpOnly : true,
        // secure: true,
        expires : Date.now() + 1000*60*60*24*7,
        maxAge : 1000*60*60*24*7
    }
}



app.use(session(sessionConfig));
app.use(flash());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js",

    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dwmxqqp9a/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/' , userRouter);
app.use('/campgrounds' , campgroundRouter);
app.use('/campgrounds/:id/reviews' , reviewsRouter);


app.get('/' , (req,res)=>{
    res.render('home');
});



// error Handling 

app.all( '*' , (req , res ,next)=>{
    next(new ExpressError('Page not found' , 404));
})


app.use((err , req ,res ,next)=>{
    const {statusCode=500 } = err;
    if(!err.message) err.message = 'Oh No Something went Wrong!!';
    res.status(statusCode).render('error' , {err});
})


app.listen(3000, ()=>{
    console.log('listining on port 3000');
});