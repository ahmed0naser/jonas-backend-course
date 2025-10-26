const AppError = require("../utils/AppError");
const Tour = require("./../models/tourModel");
const ApiFeatures = require("./../utils/ApiFeatures");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./handlerFactory");

// exports.midw=(req,res,next)=>{
//     if(!req.body.name || !req.body.price){
//         return res.status(400).json({
//             status:'failed',
//             message:'no name or price'
//         })

//     }
//     next();
// };

// exports.checkId = (req, res, next, val) => {
//   console.log(`id is ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'failed',
//       message: 'id invalid',
//     });
//   }
//   next();
// };
exports.alias = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingAverage,price";
  req.query.fields = "name,price,ratingAverage";
  next();
};
exports.getTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: "reviews" });
exports.createTours = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   // try {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError("no such ID", 404));
//   }
//   res.status(200).json({
//     status: "success",
//     message: "record deleted",
//   });
//   // } catch (err) {
//   //   res.status(204).json({
//   //     status: 'failed',
//   //     message: 'invalid data sent!',
//   //   });
//   // }
// });
exports.getToursStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        numRating: { $sum: "$ratingQuantity" },
        avgRatings: { $avg: "$ratingAverage" },
        avgPrice: { $avg: "$price" },
        maxPrice: { $max: "$price" },
        minPrice: { $min: "$price" },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    { $match: { _id: { $ne: "easy" } } },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
  // } catch (err) {
  //   res.status(204).json({
  //     status: 'failed',
  //     message: 'invalid data sent!',
  //   });
  // }
});

exports.monthlystats = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year * 1;
  const stats = await Tour.aggregate([
    {
      $unwind: "$startDates",
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $limit: 6,
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
  // } catch (err) {
  //   res.status(204).json({
  //     status: 'failed',
  //     message: 'invalid data sent!',
  //   });
  // }
});
