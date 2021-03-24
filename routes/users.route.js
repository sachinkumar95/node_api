const express = require('express');
const router = express.Router();
const User = require('../controllers/users.controller');

router.post('/login', User.login);
 router.post('/createUser', User.createUser);
 router.put('/updateUser/:Id', User.update);
 router.delete('/deleteUser/:Id', User.delete);
 router.post('/forgetPassword', User.forgetPassword);
 router.post('/forgetPassword', User.forgetPassword);


module.exports = router;