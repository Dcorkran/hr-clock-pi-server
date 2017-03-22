const SERVER_URL = 'http://localhost:8080';
var express = require('express');
var router = express.Router();
var rp = require('request-promise');
var date = require('./parseDate')

function getNewAlarm(){
  var options = {
      method: 'GET',
      uri: `${SERVER_URL}/clock?id=1`,
      json: true // Automatically parses the JSON string in the response
    };
  return rp(options)
      .then(function (data) {
        // res.json(data);
        return data[0];
      })
      .catch(function (err) {
        console.log(err);
        // res.json(err);
        return err
          // API call failed...
      });
}

module.exports.getNewAlarm = getNewAlarm;
