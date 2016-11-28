var fetchDataSources = function(options) {

  // var options = {
  //   url: 'https://api.github.com/events',
  //   headers: {
  //     'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; Nexus 5 Build/LMY48B; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/43.0.2357.65 Mobile Safari/537.36',
  //     'Authorization': 'token ' + process.env.GITHUB_OAUTH_KEY
  //   }
  // };
  // request(options, function (error, response, body) {
  //   if (!error && response.statusCode == 200) {
  //     var data = JSON.parse(body);
  //     var stripedData = stripData(data);  // Keep only useful keys
  //     allClients.forEach(function(socket){
  //       if(socket != null && socket.connected == true){
  //           redis_client.get('connected_users', function(err, count) {
  //               if(!err && count != null){
  //                   socket.volatile.json.emit('github', {data: stripedData, connected_users: count});
  //               }else{
  //                 logger.error(err.message);
  //               }
  //           });
  //       }
  //     });
  //
  //   } else {
  //     logger.error("GitHub status code: " + response.statusCode);
  //   }
  // });
  setTimeout(fetchDataSources, 2000);
}

function stripData(data) {
  return data; // do necessary data transformations here.
};

module.exports.fetchDataSources = fetchDataSources;
