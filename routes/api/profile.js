const express = require('express');
const router = express.Router();

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Profile Works"})); 
//Will refer to /api/profile/test because of User route in server.js file

module.exports = router;
