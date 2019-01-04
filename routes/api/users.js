const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const router = express.Router();

//Load User model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({msg: "Users Works"})); 
//Will refer to /api/users/test because of User route in server.js file

// @route   GET api/users/register
// @desc    Register User
// @access  Public
router.post('/register', (req, res) => {
    //Find if the email exists
    User.findOne({ email: req.body.email })
        .then(user => {
            if(user) {
                return res.status(400).json({email: 'Email already exists'});
            } else {
                //Creates avatar
                const avatar = gravatar.url(req.body.email, {
                    s: '200',   //size
                    r: 'pg',    //rating
                    d: 'mm',    //default is set to empty avatar
                })
                //Creates new user
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });

                //Generates salt with bcrypt for password hashing
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
    
});

module.exports = router;
