const router = require('express').Router();
const User = require('../model/User.js');
const { register } = require('../controllers/registration.js');
const login  = require('../controllers/login.js');


router.post('/register', register);
router.post('/login', login);


module.exports = router;
