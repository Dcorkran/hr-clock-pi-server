var moment = require('moment')

function formatDate(date){

  var parsedDate = moment(date).format();
  var dateObj = {};
  dateObj.month = parsedDate.substr(5,2);
  dateObj.day = parsedDate.substr(8,2);
  dateObj.hour = parsedDate.substr(11,2);
  dateObj.minute = parsedDate.substr(14,2);

  return dateObj;
}

module.exports.formatDate = formatDate;
