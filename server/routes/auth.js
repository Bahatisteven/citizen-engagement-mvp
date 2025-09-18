const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.js');

// routes for authentication 
router.post('/register', register);

// routes for login
router.post('/login', login);

module.exports = router;
