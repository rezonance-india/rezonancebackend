const express = require("express");
const requireLogin = require("../middlewares/requireLogin");
const router = express.Router();
const Messages = require("../models/Messages");

//Send a new message
router.post("/send",requireLogin,(req,res) => {

    const {to} = req.body;

    const {trackName,albumArt,trackUrl,artistName} = req.body; 

    const messageData = {
        trackName,
        albumArt,
        trackUrl,
        artistName
    }

    Messages.findOne({
        $or:[
            {
                $and:[{user : req.user._id},{to}]
            },
            {
                $and:[{user:to},{to:req.user._id}]
            }
        ]
    }).then((data) => {
        if(data){
            console.log("yes");

            Messages.findOneAndUpdate({
                $or:[
                    {user:req.user._id},{to:req.user._id}
                ]
            },{
                $push :{
                    chat: {user: req.user._id, message:messageData}
                }
            },
            {
                new:true,
                runValidators:true,
                useFindAndModify:true
            })
            .populate("user",["name","_id"])
            .populate("to",["_id","name"])
            .then((data) => {
                console.log(data,"Data");
                res.status(200).json(data);
            }).catch((err) => {
                res.status(400).json(err);
            });
        }
        else {
            console.log("no");
            const data = {
                user:req.user._id,
                to,
                chat:[
                    {
                        user:req.user._id,
                        message:messageData
                    }
                ]
            }

            const newChat = new Messages(data);
            
            newChat.save()
            .then((chat) => {
                chat.populate("user",["name","_id"])
                .populate("to",["_id","name"]).execPopulate()
                .then(() => {
                    res.status(200)
                    .json(chat);
                }).catch((err) => {
                    res.status(400)
                    .json(err);
                })
            }).catch((err) => {
                res.status(400).json(err);
            })
        }
    })  
})

//Get the messages from friends
router.get("/getMessages",requireLogin,(req,res) => {
    Messages.find({
        $or:[{user:req.user._id},{to:req.user._id}]
    })
    .populate("to",["_id","name"])
    .populate("user",["_id","name"])
    .populate("chat.user",["_id","name"])
    .sort({"chat.date":1})
    .then((data) => {
        res.status(200).json(data);
    }).catch((err) => {
        res.status(400).json(err);
    })
})

module.exports = router;