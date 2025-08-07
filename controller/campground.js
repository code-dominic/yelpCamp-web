const Campground = require('../models/campground.js')
const { cloudinary } = require('../cloudinary/index.js');


module.exports.index = async(req,res)=>{
    const campgrounds = await Campground.find();
    res.render('./campground/index' , {campgrounds})
};


module.exports.createCampground = async(req , res,next)=>{
    const campground  = new Campground(req.body.campground);
    campground.images = req.files.map( f=>({ url : f.path , filename: f.filename}));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success' , 'Successfully Made a new Campground!!');
    res.redirect(`campgrounds/${campground._id}`);

};


module.exports.renderNewForm = (req,res)=>{
    res.render('campground/new');
};

module.exports.showCampground = async(req,res)=>{
    const campground = await Campground.findById(req.params.id).populate({
            path : 'reviews',
            populate : {
                path : 'author'
            }
    }).populate('author');
    if(!campground){
        req.flash('error' , 'Campground not found!!');
        return  res.redirect('/campgrounds');
    }
    res.render('campground/show' , {campground});
};

module.exports.renderEditForm = async(req ,res)=>{
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error' , 'Campground not found!!');
        return  res.redirect('/campgrounds');
    }
    res.render('campground/edit' , {campground});
};

module.exports.updateCampground = async(req , res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id , {...req.body.campground} , {new:true});
    const imgs = req.files.map( f=>({ url : f.path , filename: f.filename}))
    campground.images.push(...imgs);
    await campground.save();
    if(req.body.deleteImages){
        for(let filename  of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull : { images : { filename : {  $in : req.body.deleteImages}}}});
        console.log(campground);
    }
    req.flash('success' , 'Sussesfully update campground')
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async(req,res)=>{
    const { id } = req.params;
    await Campground.findByIdAndDelete( id );
    req.flash('success', 'successFully Deleted Campground')
    res.redirect('/campgrounds');
};