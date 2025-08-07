const User = require('../models/user');

module.exports.renderRegisterForm =  (req,res)=>{
    res.render('user/register');
}

module.exports.createNewUser = async(req,res)=>{
    try{
    const { username , email , password} = req.body;
    const user = new User({email , username})
    const registeredUser = await User.register(user,password);
    req.login(registeredUser , err=>{
        if (err) return next(err);
        req.flash('success' , 'Welcome to Yelp-camp');
    res.redirect('/campgrounds');
    });
    }catch(e){
        req.flash('error' , e.message);
        res.redirect('/register');
    }

};

module.exports.renderLoginForm = (req,res)=>{
    res.render('user/login');
}

module.exports.login = (req,res)=>{
    req.flash('success' , 'Welcome Back');
    console.log(res.locals.returnTo)
    const redirectUrl = res.locals.returnTo || '/campgrounds'
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next
        }
    });
    req.flash('success' , 'SuccesFully Logged Out!!');
    res.redirect('/login');
};