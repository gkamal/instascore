load('vertx.js')

var logger = vertx.logger;

var server = vertx.createHttpServer();
var eb = vertx.eventBus;

var map = vertx.getMap('instascore');

var routeMatcher = new vertx.RouteMatcher();

routeMatcher.get('/matches/:matchId/score', function(req) {
    var matchId = req.params().matchId;
    req.response.end(JSON.stringify(map.get(matchId)));
});

routeMatcher.put('/matches/:matchId/score', function(req) {
    req.bodyHandler(function(body) {
      var matchId = req.params().matchId;
      var score =  body.toString();
      eb.publish("instascore.scoreUpdate." + matchId, 
        JSON.parse(score));
      map.put(matchId, score);
      req.response.end("success");
    });
});

routeMatcher.post('/matches/:matchId/comment', function(req) {
    req.bodyHandler(function(body) {
      var matchId = req.params().matchId;
      var comment = JSON.parse(body.toString());
      comment.time = Date.now();
      eb.publish("instascore.comments." + matchId, comment);
      req.response.end("success");
    });
});


routeMatcher.noMatch(function(req) {  
  var file = '';
  if (req.path == '/') {
    file = 'index.html';
  } else if (req.path.indexOf('..') == -1) {
    file = req.path;
  }
  req.response.sendFile('web/' + file);   
});
server.requestHandler(routeMatcher);


var sockJSServer = vertx.createSockJSServer(server);
sockJSServer.bridge({prefix : '/eventbus'}, [], [{}]);

server.listen(8080, 'localhost');
logger.info("Started successfully!!");


