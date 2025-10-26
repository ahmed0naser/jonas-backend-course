const mongoose = require("mongoose");
// const User = require("./userModel");

const tourschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "a tour must have a name"],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "a tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "a tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "a tour must have a difficulty"],
    },

    price: {
      type: Number,
      required: [true, "a tour must have a price"],
    },

    priceDiscount: Number,

    summary: {
      type: String,
      trim: true,
      required: [true, "a tour must have summary"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    //NOTE THIS OBJECT IS EMBEDED NOT schema type
    startLocation: {
      //mongoose have GeoJSON for geosaptial data
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourschema.virtual("weeks").get(function () {
  return this.duration / 7;
});
//virtual populate
tourschema.virtual("reviews", {
  ref: "Review", //the refrence model that we want the data rfom
  foreignField: "tour", //refence the fields connects with this model(tour) with the review model(the field in the review model called tour)
  localField: "_id", //where is the refrence stored in the current model(meand _id is what the review refrence the tour its connected with by)
});
////doc middleware
// tourschema.pre('save',function(next){///this is pointing on the document that will be saved

//   next();
// })
// tourschema.post('save',(doc,next)=>{
//   console.log(doc);

//   next();
// })
//////////////
//embedding users into tours
// tourschema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });///////////////////
/////////query middleware
tourschema.pre(/^find/, async function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});
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
const Tour = mongoose.model("Tour", tourschema);
module.exports = Tour;
