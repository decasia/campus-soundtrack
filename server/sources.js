var request = require("request");  // To make HTTP requests at the server side

function randomCourse() {
  var depts = ['ANTH', 'SOC', 'ENGL', 'MATH', 'HIST', 'PHYS', 'KINE'],
      num = Math.floor(Math.random() * 200) + 100;
  return depts[Math.floor(Math.random() * depts.length)] + ' ' + num.toString();
}

function sampleData() {
  var data = [];

  if (Math.random() < 0.3) {
    data.push({ type: 'lms-signon', message: 'A user signed on to Moodle' });
  }

  if (Math.random() < 0.2) {
    data.push({ type: 'lms-submission', description: randomCourse(), message: 'A user submitted an assignment' });
  }

  if (Math.random() < 0.3) {
    data.push({ type: 'lms-course-update', description: randomCourse(), message: 'A moodle course was changed' });
  }

  if (Math.random() < 0.3) {
    data.push({ type: 'library-entry', message: 'Someone came to the library' });
  }

  if (Math.random() < 0.15) {
    data.push({ type: 'network-overload', message: 'Network overloaded!' });
  }

  if (Math.random() < 0.7) {
    data.push({ type: 'email-sent', message: 'Someone sent an email' });
  }

  if (Math.random() < 0.7) {
    data.push({ type: 'event-started', message: 'A campus event started' });
  }
  return data;
}

var fetchDataSources = function(clients, options) {

  if (process.env.NODE_ENV == 'demo') {
    allClients.forEach(function(socket){
      if(socket != null && socket.connected == true){
          redis_client.get('connected_users', function(err, count) {
              if (!err && count != null) {
                socket.volatile.json.emit('campus', {data: sampleData(), connected_users: count});
              } else {
                logger.error(err.message);
              }
          });
      }
    });
  }
  setTimeout(fetchDataSources, 2000);
}

module.exports.fetchDataSources = fetchDataSources;
module.exports.sampleData = sampleData;
