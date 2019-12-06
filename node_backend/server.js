const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
var request = require('request');
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const port = 4000

function send_push_notif(uid,stop){
    if(stop=="true"){
        console.log(stop);
        
        var clientServerOptions = {
            uri: 'http://192.168.2.158:8080/sw_notify',
            body: JSON.stringify({"message":"Process Being stopped by user "+uid,"user":uid}),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    }
    else if(stop=="false"){
        console.log(stop);
        var clientServerOptions = {
            uri: 'http://192.168.2.158:8080/sw_notify',
            body: JSON.stringify({"message":"Process Being started by user "+uid,"user":uid}),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    }
    
    request(clientServerOptions, function (error, response) {
        console.log(error,response.body);
        return;
    });
}

async function send_ws_notif(uid,stop){
    var clientServerOptions = {
        uri: 'http://192.168.2.158:8080/ws_notify',
        body: JSON.stringify({"user":uid,"stop":stop}),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    request(clientServerOptions, function (error, response) {
        // console.log(error,response.body);
        return;
    });
}



app.post('/notify/', function(req, res) {
    var data = req.body;
    userid=9999
    stopped=false
    for(var i in data){
        
        x=JSON.parse(i);
        userid=x["logged_in"]
        stopped = x["stop"]
        send_push_notif(userid,stopped);
        
        // setTimeout(,5000);
    }
    // console.log();

    setTimeout(function() {
        send_ws_notif(userid,stopped)
    }, 5000);
    res.send("ssup")
    // await saveToDatabase(subscription) //Method to save the subscription to Database
    // res.json({ message: 'success' })
  })






app.listen(port, () => console.log(`Example app listening on port ${port}!`))