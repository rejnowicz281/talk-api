if (process.env.NODE_ENV !== "production") require("dotenv").config();

// const rateLimit = require("express-rate-limit");
const compression = require("compression");
const debug = require("debug")("app:db");
const express = require("express");
const helmet = require("helmet");
const createError = require("http-errors");
const mongoose = require("mongoose");
const cors = require("cors");
const fileupload = require("express-fileupload");
const cookieParser = require("cookie-parser");

const app = express();

const authRouter = require("./routes/auth");
const userRouter = require("./routes/users");
const roomRouter = require("./routes/rooms");

const { initSocket } = require("./socket");
// connect to mongodb && listen for requests
const URI = process.env.MONGOD_URI;

mongoose
    .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        const server = app.listen(3000);

        initSocket(server);
        debug("Connected to DB");
        debug(server.address());
    })
    .catch((err) => {
        debug(err);
    });

// passport config
require("./passport");

// middleware and static files
app.use(
    cors({
        origin: ["https://rejnowicz281.github.io", "http://localhost:5173"],
        credentials: true,
    })
);
app.use(compression());
app.use(fileupload());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(
//     rateLimit({
//         windowMs: 1 * 60 * 1000, // 1 minute
//         max: 200,
//     })
// );

// routes
app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use(authRouter);
app.use("/users", userRouter);
app.use("/rooms", roomRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    debug(err);

    let error = { message: err.message, status: err.status };

    if (req.app.get("env") === "development") error.stack = err.stack;

    res.status(err.status || 500).json({ error });
});
