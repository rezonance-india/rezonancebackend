const mongoose = require("mongoose");

const schema = mongoose.Schema;

const {ObjectId} = schema.Types;

const messagesSchema = new schema({
    user:{
        type:ObjectId,
        ref:"Users"
    },
    to:{
        type:ObjectId,
        ref:"Users"
    },
    chat:[{
        user:{
            type:ObjectId,
            ref:"Users"
        },
        message:{
            trackName:{
                type:String
            },
            artistName:{
                type:String
            },
            albumArt:{
                type:String
            },
            trackUrl:{
                type:String
            }
        },
        messageSentAt:{
            type:Date,
            default:Date.now
        }
    }]
})

const Messages = mongoose.model("Messages",messagesSchema);

module.exports = Messages;