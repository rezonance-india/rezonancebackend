const express = require("express");
const requireLogin = require("../middlewares/requireLogin");
const router = express.Router();
const Messages = require("../models/Messages");

//Send a new message
router.post("/send",(req,res) => {

    console.log("in");
    const {to,userId} = req.body;

    console.log(to,userId);
    
    console.log(typeof(to),typeof(userId));
    const {trackName,albumArt,trackUrl,artistName,track_id} = req.body; 

    const messageData = {
        trackName,
        albumArt,
        trackUrl,
        artistName,
        track_id
    }

    Messages.findOne({
        $or:[
            {
                $and:[{user : userId},{to}]
            },
            {
                $and:[{user:to},{to:userId}]
            }
        ]
    }).then((data) => {
        if(data){
            console.log("yes");

            Messages.findOneAndUpdate({
                $or:[
                    {
                        $and:[{user : userId},{to}]
                    },
                    {
                        $and:[{user:to},{to:userId}]
                    }
                ]
            },{
                $push :{
                    chat: {user: userId, message:messageData}
                }
            },
            {
                new:true,
                runValidators:true,
                useFindAndModify:true
            })
            .populate("user",["name","_id","username","photo"])
            .populate("to",["_id","name","username","photo"])
            .populate("chat.user",["_id","name","username","photo"])
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
                user:userId,
                to,
                chat:[
                    {
                        user:userId,
                        message:messageData
                    }
                ]
            }

            const newChat = new Messages(data);
            
            newChat.save()
            .then((chat) => {
                chat.populate("user",["name","_id","username","photo"])
                .populate("to",["_id","name","username","photo"])
                .populate("chat.user",["_id","name","username","photo"]).execPopulate()
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
router.post("/getMessages",(req,res) => {
    const {userId} = req.body;

    Messages.find({
        $or:[{user:userId},{to:userId}]
    })
    .populate("to",["_id","name","username","photo"])
    .populate("user",["_id","name","username","photo"])
    .populate("chat.user",["_id","name","username","photo"])
    .sort({"chat.date":1})
    .then((data) => {
        res.status(200).json(data);
    }).catch((err) => {
        res.status(400).json(err);
    })
})

module.exports = router;