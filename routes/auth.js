const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Users = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const requireLogin = require("../middlewares/requireLogin");

require("dotenv").config();
const secret = process.env.JWT_SECRET;

router.post(
    "/signup",
    [
        body("name", "Please provide a valid name").not().isEmpty(),
        body("phone", "Please provide a phone number").not().isEmpty(),
        body("email", "Please provide a valid email address").isEmail(),
        body(
            "password",
            "Please provide a password altleast 6 characters long"
        ).isLength({ min: 6 }),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, phone, email, password } = req.body;

        //Checking if the user is already signed up or not
        Users.findOne({
            email,
        }).then((user) => {
            if (user) {
                return res.status(400).json({
                    errors: [{ msg: "Email already exists" }],
                });
            }

            //If not save the new User
            bcrypt.hash(password, 10).then((hashedPass) => {
                const newUser = new Users({
                    name,
                    phone,
                    email,
                    password: hashedPass,
                });

                newUser
                    .save()
                    .then((saveduser) => {
                        res.status(200).json(saveduser);
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            });
        });
    }
);

router.post(
    "/signin",
    [
        body("email", "Please provide a valid email address").isEmail(),
        body("password", "Please provide a password").not().isEmpty(),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        //Checking if the user has registered or not

        Users.findOne({
            email,
        }).then((user) => {
            if (!user) {
                return res.status(400).json({
                    errors: [{ msg: "User not registered" }],
                });
            }

            bcrypt
                .compare(password, user.password)
                .then((isMatch) => {
                    if (isMatch) {
                        //If password matches then issue a token depending upon the payload given
                        const token = jwt.sign(
                            {
                                _id: user._id,
                            },
                            secret
                        );

                        const { _id, email, password } = user;
                        res.json({
                            token,
                            user,
                        });
                    } else {
                        return res.status(400).json({
                            errors: [{ msg: "Invalid Credentials." }],
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    }
);

router.get("/getUser", requireLogin, (req, res) => {
    Users.findById(req.user._id)
        .populate("friends",["_id","name"])
        .populate("pending",["_id","name"])
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            res.status(400).json({
                message: "User not found",
            });
        });
});
module.exports = router;
