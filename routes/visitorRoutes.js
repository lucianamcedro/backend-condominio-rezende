const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerVisitor);
router.get('/:email', userController.getVisitor);

module.exports = router;
