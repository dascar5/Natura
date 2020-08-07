const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const Router = express.Router();

Router.get('/', authController.isLoggedIn, viewController.getOverview);
Router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
Router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
Router.get('/me', authController.protect, viewController.getAccount);

Router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);

module.exports = Router;
