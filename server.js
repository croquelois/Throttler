const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');

let lastId = 0;
let computation = {};

let app = express();
app.set('port',process.env.PORT || 9001);
app.use(bodyParser.json());
app.get("/Throttler.js", (req,res) => res.sendFile(__dirname + '/Throttler.js'));
app.get("/client.js", (req,res) => res.sendFile(__dirname + '/client.js'));
app.get("/index.html", (req,res) => res.sendFile(__dirname + '/index.html'));
app.get("/", (req,res) => res.sendFile(__dirname + '/index.html'));

app.post("/compute", function(req,res){
  let id = lastId++;
  let comp = computation[id] = {id, status:"ongoing"};
  let r = Math.random();
  let time = Math.trunc(Math.pow(r,4)*10000);
  setTimeout(function(){
    comp.status = "done";
    comp.data = time;
  }, time);
  res.status(200).send(comp);
});
  
app.get("/compute/:id", function(req,res){
  let id = req.params.id;
  if(!computation[id])
    return res.status(404).send("not found");
  res.status(200).send(computation[id]);
  if(computation[id].status == "done")
    delete computation[id];
});
  
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});