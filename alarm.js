// var stop = false;
var player = require('play-sound')(opts = {});




  function alarmOn(){
    return setInterval(function(){
      player.play('airhorn.mp3', function(err){
        if (err) throw err
      })
    }, 3000);
  }




// function alarmIteration(){
//   setTimeout(function(){console.log('hi'); }, 1000);
// }

module.exports.alarmOn = alarmOn;
// module.exports.stop = stop;
