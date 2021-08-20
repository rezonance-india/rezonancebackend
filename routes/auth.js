const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Users = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const requireLogin = require("../middlewares/requireLogin");

require("dotenv").config();
const secret = process.env.JWT_SECRET;

router.post("/signup",(req,res) => {
        
    const { name, photo, email} = req.body;

    //Checking if the user is already signed up or not
    Users.findOne({
        email,
    }).populate("pending",["_id","name","username","photo"])
    .populate("friends", ["_id", "name","username","photo"])
    .then((user) => {
        if (user) {
            
            const token = jwt.sign(
            {
                _id: user._id,
            },
                secret
            );
            //The user details are already saved, so return the current user
            res.status(200).json({
                user,
                token
            });        
        }
        else{
            const newUser = new Users({
                name,
                email,
                photo,
            });

            newUser
                .save()
                .then((savedUser) => {
                    const token = jwt.sign(
                    {
                        _id: savedUser._id,
                    },  
                        secret
                    );

                    res.status(200).json({
                        user:savedUser,
                        token
                    })
                })
                .catch((err) => {
                    console.log(err);
                });

        }
    });    
})

router.post(
    "/updateUsername",
    [
        body("username","Please provide a username").not().isEmpty()
    ]
    ,requireLogin,(req,res) => {

    const {username,email} = req.body;

    Users.findOne({
        username
    }).then((user) =>{
        if(user){
            res.status(400).json({
                message:"Username already exists"
            })
        }
        else{
            Users.findOneAndUpdate({
                email
            },{
                $set:{
                    username
                }
            },{
                new:true,
                runValidators:true
            }).populate("pending",["_id","name","username","photo"])
            .populate("friends", ["_id", "name","username","photo"])
            .then((user) => {

                res.status(200).json({
                    user
                });

            }).catch((err) => {
                res.status(200).json(err);
            })
        }
    })
})


router.get("/getUser",requireLogin,(req, res) => {

    Users.findById(req.user._id)
        .populate("friends",["_id","name","username",,"photo"])
        .populate("pending",["_id","name","username","photo"])
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            res.status(400).json({
                message: "User not found",
            });
        });
});

router.post("/getAUser",requireLogin,(req,res) => {

    Users.findById(req.user._id)
    .populate("pending",["_id","name","username","photo"])
    .populate("friends",["_id","name","username","photo"])
    .then((user) => {
        res.status(200).json(user);
    }).catch((err) => {
        res.status(400).json({
            message: "User not found",
        });
    })
})

module.exports = router;
