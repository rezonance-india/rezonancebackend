const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Users = require("../models/Users");

require("dotenv").config();

const secret = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({
            error: "no headers provided",
        });
    }

    //Get the token from Bearer "token"
    const token = authorization.replace("Bearer ", "");

    //Verifying the user token for accessing protected pages
    //which user gets after successful login

    jwt.verify(token, secret, (err, payload) => {
        if (err) {
            res.status(422).json({
                error: "You must be logged in",
            });
        } else {
            //Payload given at the time of signning in
            const { _id } = payload;

            Users.findById({
                _id,
            }).then((userData) => {
                req.user = userData;
                next();
            });
        }
    });
};
