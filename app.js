const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { Server } = require("socket.io");
// const config = require("config");
const { errorConverter, errorHandler } = require("./middlewares/error");
const endpoints = require("express-list-endpoints-descriptor")(express);
const routes = require("./settings/routes");

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const onboardingApp = require("./src/auth/app");
const careSimplyUser = require("./src/user/app");
//const careSimplySeller = require("./src/seller/app");
const careSimplySupport = require("./src/support/app");
const careSimplyAdmin = require("./src/admin/app");

const mediaModule = require("./src/media2/app");
const path = require("path");

const app = express();

// Create HTTP server
const httpServer = require("http").createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Adjust this to your frontend URL
        methods: ["GET", "POST"]
    }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log("New client connected");
    
    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });

    // You can add more event handlers here
    // socket.on('event_name', (data) => { ... })
});

  
app.use(function (err, req, res, next) {
  if (err) {
    // eslint-disable-next-line no-undef
    (res.log || log).error(err.stack);
    if (req.xhr) {
      res.send(500, { error: "Something went wrong!" });
    } else {
      next(err);
    }

    return;
  }
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});



// set security HTTP headers
app.use(helmet());

//media Uploads
app.use(upload.any());

// parse json request body
app.use(express.json({ limit: "50mb" }));

// parse urlencoded request body
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// enable cors
app.use(cors());
app.options("*", cors());

// cookie parser
app.use(cookieParser());

//routes
routes.configure(app, endpoints);
onboardingApp.configure(app, endpoints);
careSimplyUser.configure(app, endpoints);
//careSimplySeller.configure(app, endpoints);
careSimplySupport.configure(app, endpoints);
careSimplyAdmin.configure(app, endpoints);

mediaModule.configure(app, endpoints);

// convert error to CustomError, if needed
app.use(errorConverter);


// handle error
app.use(errorHandler);

app.use("/privacy_policy", express.static(path.resolve("privacyPolicy")));
app.use("/images", express.static(__dirname + "/images"));

module.exports = {
  app,
  httpServer,
  io
};
