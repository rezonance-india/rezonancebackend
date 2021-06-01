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
});

const Users = mongoose.model("Users", usersSchema);

module.exports = Users;
