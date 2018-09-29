"use strict";
const express = require("express");
const session = require('express-session')
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const server = require("http").Server(app);
const io = require("socket.io");
const expressMongoDb = require("express-mongo-db");
const MongoStore = require('connect-mongo')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set('trust proxy', 1) // trust first proxy

app.use(expressMongoDb("mongodb://pierreV:bonde007mLab@ds115543.mlab.com:15543/projet2_db"));
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
server.listen(4000, function () {
  console.log("Connecté sur le port 4000")
});
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: 'thisisasecretshhhh',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false
  },
  store: new MongoStore({
    url: 'mongodb://localhost:27017/exo1',
    ttl: 30 * 60
  })
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get("/", function (req, res) {
  res.render("index");
});

app.get('/profil', function (req, res) {
  let user = req.session.user
  console.log(req.session.user)
  res.render('profil', {
    title: "Super Express",
    user: user
  });
});

app.get("/form", function (req, res) {
  res.render("form", {
    title: "Connexion / Inscription"
  });
});

app.get("/jeu", function (req, res) {
  res.render("jeu", {
    title: "Survivarium"
  });
});

module.exports = app;

// ##################################################
// ##############    objets      ####################
// ##################################################
let players = {};

var carre = {
  id: Math.round(Math.random() * 10000) + new Date().getTime() + "-carre",
  backgroundColor: "#" + Math.floor(Math.random() * 16777215).toString(16),
  height: "90px",
  width: "90px",
  position: "absolute",
  top: "230px",
  left: "46%",
  padding: "0px",
  borderRadius: "50px",
  boxShadow: "inset 0px 0px 90px white,  #383838 25px 0px 20px",
  rotate: "rotate(90deg)",
  transition: "all, 0.5s",
  lifeSecondes: 5,
  liveStatus: "off",
  live: function () {
    var animationIdLive = setInterval(function () {
      carre.lifeSecondes--;
      console.log(
        "fiouuu, encore ",
        carre.lifeSecondes,
        " secondes à vivre ..."
      );
      if (carre.lifeSecondes <= 0) {
        clearInterval(animationIdLive);
        console.log("Paaf, Game Over !");
      }
    }, 1000);
  }
};

// ##################################################
// ##############    SOCKET.IO   ####################
// ##################################################

var socketIo = new io(server);

socketIo.on("connection", function (websocketConnection) {
  console.log("begin");
  websocketConnection.emit('message', 'Vous êtes bien connecté !');
  websocketConnection.broadcast.emit('message', 'Un autre client vient de se connecter !');

  websocketConnection.on("begin", function (req, res, next) {
    socketIo.emit("carreStatus", carre);
  });

  websocketConnection.on("addTime", function (req, res, next) {
    if (carre.liveStatus === "on") {
      // 3 SECONDE SUPPLEMENTAIRES
      carre.lifeSecondes = carre.lifeSecondes + 3;
      if (carre.height === "70px") {
        carre.height = "100px";
      } else if (carre.height === "100px") {
        carre.height = "70px";
      }
      socketIo.emit("3 secondes ajoutées");
      console.log("3 secondes ajoutées");
    } else if (carre.liveStatus === "off") {
      carre.liveStatus = "on";
      carre.live();
    }
    socketIo.emit("addTimeStatus", carre);
  });

  websocketConnection.on("timeTransform", function (req, res, next) {
    if (
      carre.boxShadow === "inset 0px 0px 90px white,  #383838 25px 0px 20px" ||
      carre.top === "220px"
    ) {
      carre.boxShadow = "inset 0px 0px 90px black,  #383838 2px 0px 8px ";
      carre.top = "260px";
    } else if (
      carre.boxShadow === "inset 0px 0px 90px black,  #383838 2px 0px 8px" ||
      carre.top === "260px"
    ) {
      carre.boxShadow = "inset 0px 0px 90px white,  #383838 25px 0px 20px";
      carre.top = "230px";
    }
    socketIo.emit("carreStatus", carre);
  });

  websocketConnection.on("timeStatus", function (req, res, next) {
    if (carre.lifeSecondes <= 0) {
      carre.width = "0px";
      carre.height = "0px";
      console.log("Suppression");
      socketIo.emit("removecarre", carre);
    }
  });

  websocketConnection.on("disconnect", function () {
    // On supprime le carré stocké dans l'objet squar
    // On envoie les méta données du carré au front pour suppression du DOM
    socketIo.emit("removecarre", carre);
  });
});
// // // ##################################################
// // // ##############  FIN - socket.io   ################
// // // ##################################################