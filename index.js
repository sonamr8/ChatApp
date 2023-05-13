var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");




app.use(express.static(__dirname));

var numberOfUsers = 0;
io.on('connection', (socket) => {
var userJoined = false;
socket.on('new_message', (msg) => {
socket.broadcast.emit('new_message', {
username: socket.username,
message: msg
});
});
socket.on('user_added', (username) => {
if (userJoined) return;
socket.username = username;
userJoined = true;
numberOfUsers++;
socket.emit('login', {
numberOfUsers: numberOfUsers
});
socket.broadcast.emit('user_joined', {
username: socket.username,
numberOfUsers: numberOfUsers
});
});
socket.on('typing', () => {
socket.broadcast.emit('typing', {
username: socket.username
});
});
socket.on('typing_stop', () => {
socket.broadcast.emit('typing_stop', {
username: socket.username
});
});
socket.on('disconnect', () => {
if (userJoined) {
--numberOfUsers;
socket.broadcast.emit('user_left', {
username: socket.username,
numberOfUsers: numberOfUsers
});
}
});
});



mongoose.connect("mongodb://localhost:27017", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
  
const messagesSchema = {
  name: String,
  message: String,
};
  
const Messages = mongoose.model("Messages", messagesSchema);
  

  
app.set("view engine", "ejs");
  
app.use(bodyParser.urlencoded({
    extended: true
}));
  
app.get("/messages", function(req, res){
    res.render("messages");
});
  
app.post("/messages", function (req, res) {
    console.log(req.body.name);
  const messages = new Messages({
      name: req.body.name,
      message: req.body.message,
  });
  messages.save(function (err) {
      if (err) {
          throw err;
      } else {
        res.render("messages");
      }
  });
});
  


var port = process.env.PORT || 4000;
server.listen(port, function(){
console.log('Listening on %d:' + port);
});