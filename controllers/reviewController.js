const Review = require('./../model/reviewModel');
// const catchAsync = require('./../utils/catchAsync');
const factory = require('.././controllers/handlerFactory');

//show only the reviews where the tour matches requested ID (filtering out the rest, and if no ID, get all reviews)

exports.setTourUserIds = (req, res, next) => {
  //if id not in body, find it in url, same with user -> nested routes 2 first lines
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.params.id;
  next();
};

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getAllReviews = factory.getAll(Review);
