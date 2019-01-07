const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Post Model
const Post = require('../../models/Post');

//Validation
const validatePostInput = require('../../validation/post');

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Posts Works"})); 
//Will refer to /api/posts/test because of User route in server.js file

// @route   POST api/posts
// @desc    Create post 
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validatePostInput(req.body);

    //Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name, 
        avatar: req.body.avatar,     //THIS COULD BE .name
        user: req.user.id,
    });

    newPost.save().then(post => res.json(post));

})


module.exports = router;
