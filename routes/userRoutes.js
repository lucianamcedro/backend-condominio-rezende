const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/:email', userController.getUser);
router.get('/qr/:email', userController.generateQRCode);

module.exports = router;
