const express = require('express');
const Router = express.Router();
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');
const userModel = require('./../model/userModel');

//redirect middleware
Router.use('/:tourId/reviews', reviewRouter);

//middleware za specificni parametar (id), on ima i value attribut
//Router.param('id', tourController.checkID);

Router.route('/top-5-cheap').get(
  tourController.aliasTopTours,
  tourController.getAllTours
);

Router.route('/tour-stats').get(tourController.getTourStats);
Router.route('/monthly-plan/:year').get(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  tourController.getMonthlyPlan
);

// /tours-distance?distance=233&center=-40,45,unit=mi
// /tours-distance/233/center/-40,45/unit/mi
Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(
  tourController.getToursWithin
);

Router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

Router.route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
//ovako se linkuje middleware na middleware

Router.route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour //ako si admin ili leadguide, i logovan, onda mozes da brises ture
  );

// POST /tour/234fad4/reviews (tour/tour id/reviews) -> nested route
// GET /tour/234fad4/reviews -> get all reviews for this tour
// GET /tour/234fad4/reviews/245ed -> get specific review from specific tour

Router.route('/:tourId/reviews').post(
  authController.protect,
  authController.restrictTo('user'),
  reviewController.createReview
);

module.exports = Router;
