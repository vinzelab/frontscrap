var express = require('express');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var utilities = require('utilities');
var path=require('path');
var passport=require('passport');
var Strategy = require('passport-local').Strategy;
var json2csv = require('json2csv');
var fs = require('fs');
var pagination = require('pagination');
var db = require('./db');

//JSON require
var jsondb=require('./db.json');
var jsonrep=require('./scrapeIn.json');
var selecteddropdown=[];
// var jsonrep=[{ref:"a",info:"voiture a"},{ref:"b",info:"voiture b"},{ref:"e",info:"voiture e"},{ref:"f",info:"voiture f"},{ref:"g",info:"voiture g"},{ref:"h",info:"voiture h"},{ref:"j",info:"voiture j"},{ref:"i",info:"voiture i"}];
// console.log(jsondb.tableau[1]);

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

//CSV file generate
var fields=['price','nom','km','year','fuel','power','phone','city','cp','type','url','marque','site','ref','dateScrap'];
var csv = json2csv({ data: jsondb.tableau, fields: fields});

//pagination
var paginator = new pagination.SearchPaginator({prelink:'/', current: 1, rowsPerPage: 30, totalResult: jsondb.tableau.length});
var pageInfo=paginator.getPaginationData();
console.log(pageInfo);
// utilities homemade
utilities.checkid(jsonrep);

var app = express();
// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

//css files
app.use(express.static('public'));

// parse application/json
app.use(bodyParser.json());

//flash message
app.use(flash());

//Pages
app.get('/',
function(req, res) {
  res.render('index',{jsondb:jsondb,pageInfo:pageInfo});
});

app.get('/login', function(req, res) {
    res.render('login');
});

// app.post('/login',
//   passport.authenticate('local', { successRedirect: '/',failureRedirect: '/login'}),
//   function(req, res) {
//     res.redirect('/');
//   });

app.get('/logout',
    function(req, res){
      req.logout();
      res.redirect('/');
    });

app.post('/getchecked',function(req,res){
  var postData=req.body;
  console.log(postData.content);
  var checkedarray=[];
  for (var i=0;i<postData.length;i++){
    if(jsondb.tableau[i].indexOf(postData[i])){
      checkedarray.push(jsondb.tableau[i]);
    }
  }
  console.log(checkedarray);
  var extractionselection=json2csv({data:checkedarray,fields:fields});
  fs.writeFile("public/doc/file-selection.csv", extractionselection, function(err) {
    if(err) {
        return console.log(err);
    }
    res.download("public/doc/file-selection.csv");
    console.log("The file was saved!");
});
});

app.post('/getextraction', function(req, res) {
  var extraction=json2csv({data:jsondb.tableau,fields:fields});
  fs.writeFile("public/doc/file.csv", extraction, function(err) {
    if(err) {
        return console.log(err);
    }
    res.download("public/doc/file.csv");
    console.log("The file was saved!");
});
  // res.render('index',{jsondb:jsondb});
});

app.get('/settings',

function(req, res) {
  var dropdownyear=[];
  for(var i=0;i<21;i++){
  dropdownyear.push(new Date().getFullYear()-i);}

  var dropdownkm=[];
  for(var j=1;j<21;j++){
    dropdownkm.push(j*10000);}

  res.render('settings',{dropdownkm:dropdownkm,dropdownyear:dropdownyear});
});

app.post('/settings/getvalues',
function(req,res){
  var kmpicker=req.body.selectpickerkm;
  var yearpicker=req.body.selectpickeryear;
  var selecteddropdown=[];
  selecteddropdown.push(kmpicker,yearpicker);
  console.log(selecteddropdown);
  return selecteddropdown;
});

/* On ajoute un élément à la todolist */
app.listen(8081);
