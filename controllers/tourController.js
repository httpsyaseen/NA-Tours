const Tour = require('./../model/tour');
const ApiFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

//GET ALL TOURS
exports.getAllTours = catchAsync(async (req, res, next) => {
  //EXECUTE QUERY
  const features = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sorting()
    .limitFields()
    .pagination();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

//GETTING TOUR BY ID
exports.getTourbyId = catchAsync(async (req, res, next) => {
  const tours = await Tour.findById(req.params.id).populate('reviews');
  if (!tours) {
    return next(new AppError('Cannot Found the Requestd Id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tours,
    },
  });
});

//POSTING A TOUR
exports.postTour = catchAsync(async (req, res, next) => {
  const tours = await Tour.create(req.body);
  // await tours.save();
  // if (!tours) {
  //   return next(new AppError('Invalid Data', 400));
  // }
  res.status(200).json({
    status: 'success',
    data: {
      tours,
    },
  });
});

//UPDATING ANYTHING ABOUT THE TOUR
exports.updateTourbyId = catchAsync(async (req, res, next) => {
  const tours = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tours) {
    return next(new AppError('Cannot Found the Requestd Id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tours,
    },
  });
});

exports.deleteTourbyId = catchAsync(async (req, res, next) => {
  const tours = await Tour.findByIdAndDelete(req.params.id);
  if (!tours) {
    return next(new AppError('Cannot Found the Requestd Id', 404));
  }
  res.status(204).json({
    status: 'success',
    data: tours,
  });
});

//TOUR-STATS
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4 } },
    },
    {
      $group: {
        numTour: { $sum: 1 },
        _id: { $toUpper: '$difficulty' },
        avgPrice: { $avg: '$price' },
        avgRating: { $avg: '$ratingAverage' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

//
exports.getMonthlyPLan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const data = await Tour.aggregate([
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
        numTour: { $sum: 1 },
        tour: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: {
        month: 1,
      },
    },
  ]);

  res.json({
    status: 'success',
    result: data,
  });
});
