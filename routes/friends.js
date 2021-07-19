const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const requireLogin = require("../middlewares/requireLogin");

//Sending friend request
router.post("/addFriend",requireLogin,(req,res) => {

    const {friendId} = req.body;

    console.log(req.user._id,"id");

    Users.findByIdAndUpdate({
        _id:friendId
    },{
        $addToSet:{
            pending:req.user._id
        }
    },{
        new:true,
        runValidators:true,
        useFindAndModify:true
    }).populate("pending",["_id","name"])
    .populate("friends",["_id","name"])
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
router.post("/acceptFriendRequest",requireLogin,(req,res) => {

    const {friendId} = req.body;

    Users.findById({
        _id:req.user._id
    }).then((user) => {
        var pending = user.pending.filter((pendingFriend) => {
            pendingFriend === friendId;
        });

        if(pending){
            //Adding other person as friends in your list and removing from pending
            Users.findByIdAndUpdate({
                _id:req.user._id
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
            .populate("friends", ["_id", "name"])
            .populate("pending",["_id","name"])
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
                    friends:req.user._id
                }
            },{
                new:true,
                runValidators:true
            }).populate("friends", ["_id", "name"])
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
router.post("/rejectRequest",requireLogin,(req,res) => {
    const {friendId} = req.body;

    Users.findByIdAndUpdate({
        _id:req.user._id
    },{
        $pull:{
            pending:friendId
        }
    },{
        new:true,
        runValidators:true
    })
    .populate("pending",["_id","name"])
    .populate("friends", ["_id", "name"])
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
        .populate("pending",["_id","name"])
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
                friends: req.user._id,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )
        .populate("friends", ["_id", "name"])
        .then((user) => {
            console.log(user,"friend's detail");
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

//List of all people to follow
router.post("/getAllUsers",(req,res) => {
    const {name} = req.body;

    Users.find({
        name:{
            $regex:`^${name}`,
            $options:"i"
        }
    }).populate("friends",["_id","name"])
    .then((user) => {
        res.status(200).json(user);
    })
    .catch((err) => {
        res.status(400).json(err);
    });
})

module.exports = router;
