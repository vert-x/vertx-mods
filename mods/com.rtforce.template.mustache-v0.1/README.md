# Vert.x Mustache template engine 

This is a mustache template engine that you can use in vert.x, send a req for rendering a template with some json object data and the module will send you a response with the output.

This is how you can use it!

You can configure easily names that can be mapped to routes for the templates!

When the name is not been found, you can set a default template with *.

You can also specify a templateDir.

var templateConf = {  
  nameToPath : {
		"*" : "default.html",
		"just;some;others;index" : "some.html",
                "count" : "count.html"
	},
  address : "mustachify",
  templateDir : "/views"
};

and then for example in java you can use

eb.send("mustachify", jsonObject, new Handler<Message<JsonObject>>() {

	@Override
	public void handle(Message<JsonObject> call) {
			String output = call.body.getString("output");
			// Do something with the output!
		}
	});
}

in javascript you will have something like this

eb.send("mustachify", { data : "hello world" }, function(message) {
	console.log(message.output);
});

The json object is the data that you will send to your template and in mustache you can use it with {{data}}.

For more info about mustache go to http://mustache.github.com/

You can easily use mustache.js on the client-side.

In the next version I will provide a way to bind client-side templates on the html page.

Need to figure it still out!



