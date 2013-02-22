load('vertx.js');

var logger = vertx.logger;
var eb = vertx.eventBus;

var client = vertx.createHttpClient();
client.setPort(80);
client.setHost('www.espncricinfo.com');

var id = vertx.setPeriodic(5000, function(id) {
    client.getNow("/ci/content/rss/extension.json", function(resp) {
      if (resp.statusCode == 200) {
        resp.bodyHandler(function(body) {
          var scores = JSON.parse(body);
          eb.publish("instascore.scoreUpdate.1",  
                    {"teams" : getMatchScore(scores, 'india-v-australia-2013'),
                      "time" : Date.now()});       
        }); 
      } else {
        logger.info('Error -  status code: ' + resp.statusCode);
      }
    });
});


function getMatchScore(scores, matchName) {
  for(i=0;i<scores.matches.length;i++) {
    if (scores.matches[i].c == matchName) {
      var match = scores.matches[i];
      return [parseScore(match.b1,match.b1d), 
              parseScore(match.b2,match.b2d)]
    }
  }
}

function parseScore(name, score) {
  var parts = score.split('/');
  var result = {"name": name};
  if (parts.length >= 2) {
    result.runs = parts[0].trim();
    result.wickets = parts[1].trim();
  }
  return result;
}
