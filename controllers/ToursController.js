const AppError = require('../utils/AppError');
const Tour = require('./../models/tourModel');
const ApiFeatures = require('./../utils/ApiFeatures');
const catchAsync = require('./../utils/catchAsync');

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
  req.query.limit = '5';
  req.query.sort = '-ratingAverage,price';
  req.query.fields = 'name,price,ratingAverage';
  next();
};
exports.getTours = catchAsync(async (req, res, next) => {
  // try {
  // const queryCopy = { ...req.query };
  // const excl = ['page', 'limit', 'sort', 'fields'];
  // excl.forEach((el) => {
  //   delete queryCopy[el];
  // });
  // let q = JSON.stringify(queryCopy);
  // q = q.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  // // queryCopy = JSON.parse(queryCopy);

  // let query = Tour.find(JSON.parse(q));
  // if (req.query.sort) {
  //   const sortby = req.query.sort.split(',').join(' ');
  //   query = query.sort(sortby);
  // } else {
  //   query = query.sort('-createdAt');
  // }
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // } else {
  //   query.select('-__v');
  // }
  // const limit = req.query.limit * 1 || 100;
  // const page = req.query.page * 1 || 1;
  // const skip = (page - 1) * limit;
  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments();
  //   if (skip >= numTours) throw new Error('no such page');
  // }
  // query.skip(skip).limit(limit);
  const features = new ApiFeatures(Tour.find(), req.query);
  features.filter().sort().limitfields().page();
  const tours = await features.query;
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
  //   } catch (err) {
  //     console.log(err);
  //     res.status(404).json({
  //       status: 'failed',
  //       message: err,
  //     });
  //   }
  //
});
exports.getTour = catchAsync(async (req, res, next) => {
  // try {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError('no such ID', 404));
  }
  //the above equals Tour.findOne({_id:req.params.id})
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
  //   } catch (err) {
  //     res.status(404).json({
  //       status: 'failed',
  //       message: err,
  //     });
  //   }
});

exports.createTours = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
  //   try {
  //   } catch (err) {
  //     res.status(400).json({
  //       status: 'failed',
  //       message: err,
  //     });
  //   }
});

exports.updateTour = catchAsync(async (req, res, next) => {
  // try {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('no such ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'failed',
  //     message: 'invalid data sent!',
  //   });
  // }
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  // try {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('no such ID', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'record deleted',
  });
  // } catch (err) {
  //   res.status(204).json({
  //     status: 'failed',
  //     message: 'invalid data sent!',
  //   });
  // }
});
exports.getToursStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRating: { $sum: '$ratingQuantity' },
        avgRatings: { $avg: '$ratingAverage' },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    { $match: { _id: { $ne: 'easy' } } },
  ]);
  res.status(200).json({
    status: 'success',
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
      $unwind: '$startDates',
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
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
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
    status: 'success',
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
