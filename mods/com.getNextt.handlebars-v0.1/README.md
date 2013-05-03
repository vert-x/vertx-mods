# com.getnextt.handlebars

A super-simple [Handlebars.js][http://handlebarsjs.com] module for [Vert.x][http://vertx.io]

# Usage

Pass in a JSON config object with the raw HTML as the source and your JSON object to smash into it as the data. E.g.

{
eb.send('GNhandlebars', {source: "<div>{{{text}}}</div>", data: {text: "Hello, vertx"}}, function (msg){
	req.response.end(msg.html);
});
}

# TODO

Finish this README, among many others.