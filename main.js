
load('vertx.js');
vertx.deployVerticle('web.js');
vertx.deployVerticle('score-fetcher.js');