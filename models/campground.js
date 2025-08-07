const mongoose = require('mongoose');
const Review = require('./review');
const { campgroundSchema } = require('../schemas');
const Schema = mongoose.Schema;



const ImageShema = new Schema({
    url : String,
    filename : String
})

ImageShema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload' , '/upload/w_300')
});

const CampgroundSchema = new Schema({
    title : String,
    images: [ImageShema],
    price : Number,
    location: String,
    description : String,
    author : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    reviews : [
        {
            type :Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
});

CampgroundSchema.post( 'findOneAndDelete' , async function(doc){
    if(doc){
        // const reviews = [...doc.reviews];

        // for( let review of reviews){
        //     await Review.remove({_id : review});
        // }

        await Review.deleteMany({
            _id: {
                $in : doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground' , CampgroundSchema);