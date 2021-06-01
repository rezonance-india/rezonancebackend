const mongoose = require("mongoose");

const schema = mongoose.Schema;

const { ObjectId } = schema;

const usersSchema = new schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: Number,
    },
    password: {
        type: String,
    },
    friends: [
        {
            type: ObjectId,
            ref: "Users",
        },
    ],
    playlists: [
        {
            name: {
                type: String,
            },
            songs: [
                {
                    type: Number,
                    // unique: true,
                },
            ],
        },
    ],
});

const Users = mongoose.model("Users", usersSchema);

module.exports = Users;
