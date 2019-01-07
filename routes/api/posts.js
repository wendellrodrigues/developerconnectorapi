const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');



//Post Model
const Post = require('../../models/Post');
//Profile Model
const Profile = require('../../models/Profile');


//Validation
const validatePostInput = require('../../validation/post');

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Posts Works"})); 
//Will refer to /api/posts/test because of User route in server.js file


// @route   GET api/posts
// @desc    Get all posts 
// @access  Public
router.get('/', (req, res) => {
    
    const errors = {};

    Post.find()
        .sort({date: -1})
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({nopostfound: 'No post found with that id'}));
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({nopostfound: 'No posts found'}));
});


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

});


// @route   DELETE api/posts/:id
// @desc    Delete post by id
// @access  Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    //Check for post owner
                    if(post.user.toString() !== req.user.id) {
                        return res.status(401).json({ notauthorized: 'User not authorized' });
                    }
                    //Delete
                    post.remove().then(() => res.json({success: true }));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        })
});


// @route   POST api/posts/like/:id
// @desc    Like post by id
// @access  Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) { //Means a single user's id is already in the array. Cannot like more than once
                        return res.status(400).json({ alreadyliked: 'User already liked this post'});
                    }

                    //Add user id to likes array
                    post.likes.unshift({ user: req.user.id }) //Add to beginning of the array

                    //Save to database
                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        })
});

// @route   POST api/posts/like/:id
// @desc    Unlike post by id
// @access  Private
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) { //Means a single user's id is already in the array. Cannot like more than once
                        return res.status(400).json({ notliked: 'You have not yet liked this post'});
                    }

                    //Get the remove index
                    const removeIndex = post.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id);

                    //Splice out of array
                    post.likes.splice(removeIndex, 1);

                    //Save to database
                    post.save().then(post => res.json(post));

                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
        })
});


// @route   POST api/posts/comment/:id
// @desc    Add comment to post
// @access  Private
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validatePostInput(req.body);

    //Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }


    Post.findById(req.params.id)
        .then(post => {
            console.log(post.id);
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.avatar,
                user: req.user.id
            }

            //Add to comments array
            post.comments.unshift(newComment);

            //Save
            post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found'}))

});


// @route   DELETE api/posts/comment/:id
// @desc    Remove comment from post
// @access  Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {


    Post.findById(req.params.id)
        .then(post => {
            
            //Check to see if comment exists
            if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                //Comment we are deleting does not exist
                return res.statys(404).json({ commentnotexists: 'Comment does not exist' });
            }

            //Get the remove index
            const removeIndex = post.comments
                .map(item => item._id.toString())
                .indexOf(req.params.comment_id);

            //Splice out of the array
            post.comments.splice(removeIndex, 1);

            //Save to database
            post.save().then(post => res.json(post));
            
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found'}))

});




module.exports = router;
