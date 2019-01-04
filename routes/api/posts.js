const express = require('express');
const router = express.Router();

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Posts Works"})); 
//Will refer to /api/posts/test because of User route in server.js file

module.exports = router;
