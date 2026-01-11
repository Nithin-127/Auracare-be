const express = require('express');
const router = new express.Router();

const userController = require('./controllers/userController');
const donorController = require('./controllers/donorController');
const receiverController = require('./controllers/receiverController');
const adminController = require('./controllers/adminController');
const paymentController = require('./controllers/paymentController');

const jwtMiddleware = require('./Middlewares/jwtMiddleware');
const jwtAdminMiddleware = require('./Middlewares/jwtAdminMiddleware');
const multerMiddleware = require('./Middlewares/multerMiddleware');

// User Auth Routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/google-login', userController.googleLogin);
router.patch('/profile/:id', jwtMiddleware, multerMiddleware.single('profilePic'), userController.updateProfile);

// Donor Routes
router.post('/donors/register', jwtMiddleware, multerMiddleware.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'witnessPhoto', maxCount: 1 }
]), donorController.registerDonor);
router.get('/donors/me/:userId', jwtMiddleware, donorController.getDonorByUserId);
router.get('/donors', jwtAdminMiddleware, donorController.getAllDonors);
router.get('/approved-donors', donorController.getApprovedDonors);
router.post('/contact-donor', jwtMiddleware, donorController.contactDonor);
router.get('/donor/requests/:donorId', jwtMiddleware, donorController.getDonorRequests);

// Receiver Routes
router.post('/receivers/register', jwtMiddleware, multerMiddleware.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'identityCard', maxCount: 1 }
]), receiverController.registerReceiver);
router.get('/receivers/me/:userId', jwtMiddleware, receiverController.getReceiverByUserId);
router.get('/receivers', jwtAdminMiddleware, receiverController.getAllReceivers);
router.get('/approved-receivers', receiverController.getApprovedReceivers);

// Admin Routes
router.get('/admin/stats', jwtAdminMiddleware, adminController.getStats);
router.patch('/admin/donor/:id/status', jwtAdminMiddleware, adminController.updateDonorStatus);
router.patch('/admin/receiver/:id/status', jwtAdminMiddleware, adminController.updateReceiverStatus);
router.post('/contact', adminController.saveMessage);
router.get('/admin/messages', jwtAdminMiddleware, adminController.getAllMessages);
router.delete('/admin/donor/:id', jwtAdminMiddleware, adminController.deleteDonor);
router.delete('/admin/receiver/:id', jwtAdminMiddleware, adminController.deleteReceiver);

// Payment Routes
router.post('/create-checkout-session', jwtMiddleware, paymentController.createCheckoutSession);
router.post('/verify-payment', jwtMiddleware, paymentController.verifyPayment);

module.exports = router;
