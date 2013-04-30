load('vertx.js')
load('handlebars.js')

vertx.eventBus.registerHandler('GNhandlebars', function (message, replier) {
	var template = Handlebars.compile(message.source),
		response = {};

	response.html = template(message.data);

	replier(response);
});