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
    }).populate("pending",["_id","name","username"])
    .populate("friends", ["_id", "name","username"])
    .then((user) => {
        if (user) {
            //The user details are already saved, so return the current user
            res.status(200).json({
                user
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
                    res.status(200).json({
                        user:savedUser
                    })
                })
                .catch((err) => {
                    console.log(err);
                });

        }
    });    
})

router.post("/updateUsername",(req,res) => {

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
            }).then((user) => {
                res.status(200).json({
                    user
                });
            }).catch((err) => {
                res.status(200).json(err);
            })
        }
    })
})


router.post("/getUser", (req, res) => {

    const {userId} = req.body;

    Users.findById(userId)
        .populate("friends",["_id","name","username"])
        .populate("pending",["_id","name","username"])
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            res.status(400).json({
                message: "User not found",
            });
        });
});

router.post("/getAUser",(req,res) => {

    const {_id} = req.body;

    Users.findById({
        _id
    })
    .populate("friends",["_id","name","username"])
    .then((user) => {
        res.status(200).json(user);
    }).catch((err) => {
        res.status(400).json({
            message: "User not found",
        });
    })
})

module.exports = router;
