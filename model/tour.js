const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A name is required'],
      unique: true,
      trim: true,
      min: [10, 'Tour name must be equal to or greater than 10 characters'],
      max: [40, 'Tour name must be equal to or less than 40 characters'],
    },
    slug: String,
    secretTour: Boolean,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration size'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max Group Size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a Difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        //message must be a string not array
        message: 'difficulty must be either: easy, medium, difficult',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be equal to or greater than 1'],
      max: [5, 'Rating must be equal to or greater than 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have Price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val <= this.price;
        },
        message: 'Discount price should not more than Actual price.',
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post('save', function (doc, next) {
//   console.log('I am the doc after savig into the db', doc);
//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.date = Date.now();
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query takes ${Date.now() - this.date} milliSeconds`);
  next();
});

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
