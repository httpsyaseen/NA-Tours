const Tour = require('../model/tour');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.render('overview', { title: 'All Tours', tours });
});

exports.getTour = (req, res) => {
  res.render('tour');
};
