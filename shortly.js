var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)

app.use(session({
  secret: 'more cats',
  resave: false,
  saveUninitialized: true,
  maxAge: 1000 * 60 * 60
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res) {
  if(req.session.user){
    res.render('index');
  } else {
    res.redirect('/login');
  }
});

app.get('/create', function(req, res) {
  if(req.session.user){
    res.render('index');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', function(req, res){
  res.render('login');
});

app.get('/signup', function(req, res){
  res.render('signup');
});

app.get('/links', function(req, res) {
  if(req.session.user){
    // Links.reset().fetch({where: {user_id: req.session.userId}}).then(function(links) {
    // new Link({user_id: req.session.userId})
    //   .fetchAll()
    //   .then(function(models){
    //   })
        // db.knex('urls')
        //   .join('clicks', 'clicks.link_id', 'urls.id')
        //   .select()
        //   .then(function(models){
        //     console.log(models);
        //     res.send(200, models);
        //   });
      db.knex('clicks')
        .where('user_id', '=', req.session.userId)
        .then(function(clicks) {
          console.log('CLICKCLICKCKYCYCYCY', clicks);
          // res.send(200, models);
          db.knex('urls')
            .where('user_id', '=', req.session.userId)
            .then(function(models) {

              for(var i = 0; i < clicks.length; i++){
                var link_id = clicks[i].link_id;
                for(var j = 0; j < models.length; j++){
                  if(models[j].id === link_id){
                    if(models[j].userClicks){
                      models[j].userClicks = models[j].userClicks + 1;
                    } else {
                      models[j].userClicks = 1;
                    }
                  }
                }
              }

              console.log('MODMODMODM', models);
              res.send(200, models);
            });
        });



      // model.userSpecificClick = #

      // get all clicks by user
        //iterate through clicks to get userClicks

      // links.models[0] === {
      //   visits: 10,
      //   url: //,
      //   code: //,
      //   userClicks: 
      // }
    // });
  } else {
    res.redirect('/login');
  }
});

app.post('/links', function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri, user_id: req.session.userId }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitleAndImage(uri, function(err, title, image) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          image: image,
          user_id: req.session.userId,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.post('/login', function(req, res){
  var password = req.body.password;
  var username = req.body.username;

  new User({username: username})
    .fetch()
    .then(function(model){
      if(model){
        bcrypt.compare(password, model.get('password'), function(err, result){
          if(result){
            req.session.user = model.get('username');
            req.session.userId = model.get('id');
            res.redirect('/');
          } else {
            res.redirect('/login');
          }
        });
      } else {
        res.redirect('/login');
      }
    });
});

app.post('/signup', function(req, res){
  var username = req.body.username;
  var password = req.body.password;

  new User({ username: username }).fetch().then(function(found) {
    if (found) {
      res.redirect('/signup');
    } else {

      var user = new User({
        username: username,
        password: password
      });

      req.session.user = username;

      user.save().then(function(newUser) {
        req.session.userId = newUser.get('id');
        res.redirect('/');
      });
    }
  });
});

app.post('/logout', function(req, res){
  req.session.destroy(function(){
    res.send(200, 'go!');
  });
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id'),
        user_id: req.session.userId
      });

      click.save().then(function() {
        db.knex('urls')
          .where('url', '=', link.get('url'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
