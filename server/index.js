const express = require("express"),
	bodyParser = require("body-parser"),
const cors = require("cors");
const app = express();

mongoose.Promise = global.Promise;

app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(4201);
