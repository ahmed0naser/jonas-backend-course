const mongoose = require('mongoose');

const tourschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'a tour must have a name'],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'a tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'a tour must have a difficulty'],
    },

    price: {
      type: Number,
      required: [true, 'a tour must have a price'],
    },

    priceDiscount: Number,

    summary: {
      type: String,
      trim: true,
      required: [true, 'a tour must have summary'],
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
    },
    description: {
      type: String,
      trim: true,
    },
    imgCover: {
      type: String,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourschema.virtual('weeks').get(function () {
  return this.duration / 7;
});
////doc middleware
// tourschema.pre('save',function(next){///this is pointing on the document that will be saved

//   next();
// })
// tourschema.post('save',(doc,next)=>{
//   console.log(doc);

//   next();
// })
/////////query middleware
///if you want it to work on diffrent same queries(find/findOne) use reqex instead of only 'find'
// tourschema.pre('find', function (next) {
//   ///this is gonna be pointing on the queryobject so it can be chained
//   tourschema.pre(/^find/, function (next) {

//   next();
// });
//   tourschema.post(/^find/, function (doc,next) {

//   next();
// });

////aggregation middleware (hooks)pre post('aggregate',()=>{this===current agg object})don't forget next()
const Tour = mongoose.model('Tour', tourschema);
module.exports = Tour;
