const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const requireLogin = require("../middlewares/requireLogin");

//Sending friend request
router.post("/addFriend",(req,res) => {

    const {friendId,userId} = req.body;

    Users.findByIdAndUpdate({
        _id:friendId
    },{
        $addToSet:{
            pending:userId
        }
    },{
        new:true,
        runValidators:true,
        useFindAndModify:true
    }).populate("pending",["_id","name","username"])
    .populate("friends",["_id","name","username"])
    .then((friend) => {
        res.status(200).json({
            friend
        })
    }).catch((err) => {
        res.status(400).json({
            err
        })
    }).catch((err) => {
        res.status(400).json({
            err
        })
    })
})

//Accepting friend request
router.post("/acceptFriendRequest",(req,res) => {

    const {friendId,userId} = req.body;

    Users.findById({
        _id:userId
    }).then((user) => {
        var pending = user.pending.filter((pendingFriend) => {
            pendingFriend === friendId;
        });

        if(pending){
            //Adding other person as friends in your list and removing from pending
            Users.findByIdAndUpdate({
                _id:userId
            },{
                $addToSet:{
                    friends:friendId
                },
                $pull:{
                    pending:friendId
                }
            },{
                new:true,
                runValidators:true
            })
            .populate("friends", ["_id", "name","username"])
            .populate("pending",["_id","name","username"])
            .then((friends) => {
                res.status(200).json({
                    friends
                })
            }).catch((err) => {
                res.status(400).json({
                    err
                })
            })

            //Adding yourself as friend in the other's list
            Users.findByIdAndUpdate({
                _id:friendId
            },{
                $push:{
                    friends:userId
                }
            },{
                new:true,
                runValidators:true
            }).populate("friends", ["_id", "name","username"])
            .then((friend) =>{
                console.log(friend,"friends");
            }).catch((err) => {
                res.status(400).json({
                    err
                })
            })
        }
    })
})

//Reject Request
router.post("/rejectRequest",(req,res) => {
    const {friendId,userId} = req.body;

    Users.findByIdAndUpdate({
        _id:userId
    },{
        $pull:{
            pending:friendId
        }
    },{
        new:true,
        runValidators:true
    })
    .populate("pending",["_id","name","username"])
    .populate("friends", ["_id", "name","username"])
    .then((friends) => {
        res.status(200).json({
            friends
        })
    }).catch((err) => {
        res.status(400).json({
            err
        })
    })
})

//Remove a friend
router.post("/removeFriend", (req, res) => {
    const { friendId,userId} = req.body;

    Users.findByIdAndUpdate(
        {
            _id: userId,
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
        .populate("friends", ["_id", "name","username"])
        .populate("pending",["_id","name","username"])
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            res.status(400).json(err);
        });

    Users.findByIdAndUpdate(
        {
            _id: friendId,
        },
        {
            $pull: {
                friends: userId,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )
        .populate("friends", ["_id", "name","username"])
        .then((user) => {
            console.log(user,"friend's detail");
        })
        .catch((err) => {
            res.status(400).json(err);
        });
});

//List all friends
router.post("/getAllFriends", (req, res) => {

    const {userId} = req.b

    Users.findById(userId)
        .populate("friends", ["_id", "name","username"])
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            res.status(400).json(err);
        });
});

//List of all people to follow
router.post("/getAllUsers",(req,res) => {
    const {name} = req.body;

    Users.find({
        username:{
            $regex:`^${name}`,
            $options:"i"
        }
    }).populate("friends",["_id","name","username"])
    .then((user) => {
        res.status(200).json(user);
    })
    .catch((err) => {
        res.status(400).json(err);
    });
})

module.exports = router;
