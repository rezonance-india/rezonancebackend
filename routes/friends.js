const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const requireLogin = require("../middlewares/requireLogin");

//Adding a friend
// router.post("/addFriend", requireLogin, (req, res) => {
//     const { friendId } = req.body;

//     Users.findById(req.user._id).then((user) => {
//         if (user.friends.length > 0) {
//             var friend = user.friends.filter((friend) => {
//                 friend === friendId;
//             });
//         }

//         if (!friend) {
//             Users.findByIdAndUpdate(
//                 {
//                     _id: req.user._id,
//                 },
//                 {
//                     $push: {
//                         friends: friendId,
//                     },
//                 },
//                 {
//                     new: true,
//                     runValidators: true,
//                 }
//             )
//                 .populate("friends", ["_id", "name"])
//                 .then((user) => {
//                     res.status(200).json(user);
//                 })
//                 .catch((err) => {
//                     res.status(400).json(err);
//                 });
//         } else {
//             res.status(400).json({
//                 message: "Alredy added as friend",
//             });
//         }
//     });
// });

//Sending friend request
router.post("/addFriend",requireLogin,(req,res) => {

    const {friendId} = req.body;

    Users.findByIdAndUpdate({
        _id:friendId
    },{
        $push:{
            pending:req.user_id
        }
    },{
        new:true,
        runValidators:true
    }).then((friend) => {
        res.status(200).json({
            friend
        })
    }).catch((err) => {
        res.status(400).json({
            err
        })
    })
})

//Accepting friend request
router.post("/acceptFriendRequest",(req,res) => {

    const {friendId} = req.body;

    Users.findById(req.user._id).then((user) => {
        var pending = user.pending.filter((pendingFriend) => {
            pendingFriend === friendId;
        });

        if(pending){
            //Adding other person as friends in your list and removing from pending
            User.findByIdAndUpdate({
                id:req.user_id
            },{
                $push:{
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
            then((friend) =>{
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
