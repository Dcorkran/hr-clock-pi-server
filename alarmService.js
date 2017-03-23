var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var app = express();
var server = http.Server(app);
var websocket = socketio(server);
var schedule = require('node-schedule');
var alarm = require('./alarm');
var db = require('./db');
var parsedDate = require('./parseDate');
var noble = require('noble');

server.listen(5000, () => console.log('listening on *:5000'));
var i = 0;
var j;
var beep;
var stop = false;
// var beep = alarm.alarmOn();


websocket.on('connection', (socket) => {
  console.log('A client just joined on', socket.id);
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('alarm update', function(){
    alarmDate = db.getNewAlarm()
    .then((data)=>{
      var dateObj = parsedDate.formatDate(data.alarm);
      j = schedule.scheduleJob(`${dateObj.minute} ${dateObj.hour} ${dateObj.day} ${dateObj.month} *`, function(){
        console.log('hi');
        socket.emit('hi','hi');
        beep = alarm.alarmOn();
      });
      console.log(data.alarm);
    })
  });
});

app.get('/unlock', function(req, res){
  console.log('hit');
  stop = true;
  clearInterval(beep);
  console.log(beep);
 });

 noble.on('stateChange', function(state) {
   if (state === 'poweredOn') {
     // Seek for peripherals broadcasting the heart rate service
     // This will pick up a Polar H7 and should pick up other ble heart rate bands
     // Will use whichever the first one discovered is if more than one are in range
     noble.startScanning(["180d"]);
   } else {
     noble.stopScanning();
   }
 });

 websocket.sockets.emit('hi','hi');
  websocket.on('hi',function(){
    console.log('hi');
  })



 noble.on('discover', function(peripheral) {
   console.log(peripheral.advertisement.localName);
   // Once peripheral is discovered, stop scanning
   // noble.stopScanning();

   // connect to the heart rate sensor
   if (peripheral.advertisement.localName === 'Polar H7 DAA61611') {
     peripheral.connect(function(error){
       // 180d is the bluetooth service for heart rate:
       // https://developer.bluetooth.org/gatt/services/Pages/ServiceViewer.aspx?u=org.bluetooth.service.heart_rate.xml
       var serviceUUID = ["180d"];
       // 2a37 is the characteristic for heart rate measurement
       // https://developer.bluetooth.org/gatt/characteristics/Pages/CharacteristicViewer.aspx?u=org.bluetooth.characteristic.heart_rate_measurement.xml
       var characteristicUUID = ["2a37"];

       // use noble's discoverSomeServicesAndCharacteristics
       // scoped to the heart rate service and measurement characteristic
       peripheral.discoverSomeServicesAndCharacteristics(serviceUUID, characteristicUUID, function(error, services, characteristics){
         characteristics[0].notify(true, function(error){
           characteristics[0].on('data', function(data, isNotification){
             // Upon receiving data, output the BPM
             // The actual BPM data is stored in the 2nd bit in data (at array index 1)
             // Thanks Steve Daniel: http://www.raywenderlich.com/52080/introduction-core-bluetooth-building-heart-rate-monitor
             // Measurement docs here: https://developer.bluetooth.org/gatt/characteristics/Pages/CharacteristicViewer.aspx?u=org.bluetooth.characteristic.heart_rate_measurement.xml
             console.log('data is: ' + data[1]);
             console.log(i);
             websocket.sockets.emit('beep',data[1]);

             if (data[1] >= 100) {
               i++;
             }
             if (i > 15) {
               clearInterval(beep);
             }
           });
         });
       });
     });
   }

 });

 // http.listen(5000, function(){
 //   console.log('listening on *:5000');
 // });
