const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

//Requiring routes
const auth = require("./routes/auth");

dotenv.config();

const db = process.env.MONGO_URI;

mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .then(() => console.log("Database connected"))
    .catch((err) => {
        console.log(err);
    });

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(bodyParser.json());

app.use(cors());

app.use("/user", auth);

const PORT = process.env.PORT || 5000;

var server = app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`);
});
