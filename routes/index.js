var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
})
  .post('/form', function (req, res, next) {
    var name = req.body.name.trim();
    var password = req.body.password;
    // /---/  MONGO  /---/ //
    req.db.collection('utilisateurs').findOne({
      name: {
        $regex: name,
        $options: "is"
      },
    }, function (err, result) {
      if (result) {
        res.render('form', {
          error: true,
          message: "Le pseudo est déja pris"
        })
      } else {
        req.db.collection('utilisateurs').insertOne({
          name: name,
          password: password
        },
          err => {
            if (err) {
              throw err;
            } else {
              let user = {
                name: name,
                password: password
              }
              req.session.user = user
              res.redirect("/profil");
              console.log(req.body)
            }
          })
      }
    })
    // /-------//-------/ //
  })
// .get('/profil', function (req, res, next) {
//   console.log(req.db.collection('users').findOne({}, {
//     sort: {
//       _id: -1
//     },
//     limit: 1
//   }));
//   req.db.collection('users').findOne({}, {
//     sort: {
//       _id: -1
//     },
//     limit: 1
//   });
// req.db.collection('users').findOne({

// })
// res.render('profil', {
//   firstname: firstname,
//   lastname: lastname,
//   username: username,
//   adresse: adresse,
//   age: age,
//   email: email,
//   username: req.body.username
// })
// })

module.exports = router;