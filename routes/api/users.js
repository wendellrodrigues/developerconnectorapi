const express = require('express');
const router = express.Router();

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Users Works"})); 
//Will refer to /api/users/test because of User route in server.js file

module.exports = router;
