const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const requireLogin = require("../middlewares/requireLogin");

//Adding a friend
router.post("/addFriend", requireLogin, (req, res) => {
    const { friendId } = req.body;

    Users.findById(req.user._id).then((user) => {
        if (user.friends.length > 0) {
            var friend = user.friends.filter((friend) => {
                friend === friendId;
            });
        }

        if (!friend) {
            Users.findByIdAndUpdate(
                {
                    _id: req.user._id,
                },
                {
                    $push: {
                        friends: friendId,
                    },
                },
                {
                    new: true,
                    runValidators: true,
                }
            )
                .populate("friends", ["_id", "name"])
                .then((user) => {
                    res.status(200).json(user);
                })
                .catch((err) => {
                    res.status(400).json(err);
                });
        } else {
            res.status(400).json({
                message: "Alredy added as friend",
            });
        }
    });
});

//Remove a friend
router.post("/removeFriend", requireLogin, (req, res) => {
    const { friendId } = req.body;

    Users.findByIdAndUpdate(
        {
            _id: req.user._id,
        },
        {
            $pull: {
                friends: friendId,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )
        .populate("friends", ["_id", "name"])
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            res.status(400).json(err);
        });
});

//List all friends
router.get("/getAllFriends", requireLogin, (req, res) => {
    Users.findById(req.user._id)
        .populate("friends", ["_id", "name"])
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            res.status(400).json(err);
        });
});

module.exports = router;
