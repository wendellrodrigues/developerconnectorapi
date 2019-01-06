const express   = require('express');
const router    = express.Router();
const mongoose  = require('mongoose');
const passport  = require('passport');
const isEmpty   = require('../../validation/is-empty');

//Load Validation
const validateProfileInput = require('../../validation/profile');

//Load Profile Model
const Profile = require('../../models/Profile');

//Load User Model
const User = require('../../models/User');

// @route   GET api/profile/
// @desc    Get current User's profile
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    //The errors
    const errors = {};

    //Find
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(!profile) {
                errors.noProfile = 'There is no profile for this user'
                return res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});

// @route   POST api/profile/
// @desc    Create or Edit user Profile
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    //Validation
    const { errors, isValid } = validateProfileInput(req.body);

    console.log(`Handle is ${isEmpty(req.body.handle)}`);
    console.log(errors);


    //Check Validation
    if(isValid === false) {
        return res.status(400).json(errors);
    }

    //Get fields
    const profileFields = {};
    profileFields.user = req.user.id;

    //Single Fields
    if(req.body.handle)         profileFields.handle            = req.body.handle;
    if(req.body.company)        profileFields.company           = req.body.company;
    if(req.body.website)        profileFields.website           = req.body.website;
    if(req.body.location)       profileFields.location          = req.body.location;
    if(req.body.bio)            profileFields.bio               = req.body.bio;
    if(req.body.status)         profileFields.status            = req.body.status;
    if(req.body.githubusername) profileFields.githubusername    = req.body.githubusername;

    //Skills - Split into an array (Comma separated values)
    if(typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',')
    }

    //Social Links (In its own objects)
    profileFields.social = {};
    if(req.body.youtube)    profileFields.social.youtube    = req.body.youtube;
    if(req.body.twitter)    profileFields.social.twitter    = req.body.twitter;
    if(req.body.facebook)   profileFields.social.facebook   = req.body.facebook;
    if(req.body.linkedin)   profileFields.social.linkedin   = req.body.linkedin;
    if(req.body.instagram)  profileFields.social.instagram  = req.body.instagram;

    //Experience and Education are separate forms

    //Create the profile
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if(profile) {
                //Update the profile
                Profile.findOneAndUpdate(
                    { user: req.user.id }, 
                    { $set: profileFields }, 
                    { new: true }
                )
                .then(profile => res.json(profile))
            } else { //Create Profile
                //Check if handle exists
                Profile.findOne({ handle: profileFields.handle })
                    .then(profile => {
                        if(profile) {
                            errors.handle = 'That handle already exists';
                            res.status(400).json(errors);
                        }
                        //Save Profile
                        new Profile(profileFields.save()
                            .then(profile => res.json(profile))
                        )
                    })
            }
        })

});





// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Profile Works"})); 
//Will refer to /api/profile/test because of User route in server.js file

module.exports = router;
