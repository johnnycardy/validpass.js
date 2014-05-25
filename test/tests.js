test("Invalid initial value - synchronous", function() {
	expect(1)
	var input = $('<input/>');
	var ctrl = new window.ValidPass.Runner(input[0], ['lowercase']);
	
	ok(!ctrl.result, "Passed!" );
});

test("Valid initial value - synchronous", function() {
	expect(1)
	var input = $('<input/>').val("hello");
	var ctrl = new window.ValidPass.Runner(input[0], ['lowercase']);
	
	ok(ctrl.result, "Passed!" );
});

asyncTest("Empty initial value - asynchronous", function() {
	expect(1)
	var input = $('<input/>');
	var ctrl = new window.ValidPass.Runner(input[0], ['lowercase']);

	ctrl.registerCallback(function(result){
		ok(!result, "Passed!" );
		start();
	});
});


test("Rule Test - lowercase - positive", function() {
	expect(1)
	var input = $('<input/>').val("a");
	var ctrl = new window.ValidPass.Runner(input[0], ['lowercase']);
	
	ok(ctrl.result, "Passed!" );
});


test("Rule Test - uppercase - positive", function() {
	expect(1)
	var input = $('<input/>').val("A");
	var ctrl = new window.ValidPass.Runner(input[0], ['uppercase']);
	
	ok(ctrl.result, "Passed!" );
});

test("Rule Test - numbers - positive", function() {
	expect(1)
	var input = $('<input/>').val("1");
	var ctrl = new window.ValidPass.Runner(input[0], ['numbers']);
	
	ok(ctrl.result, "Passed!" );
});

test("Rule Test - punctuation - positive", function() {
	expect(1)
	var input = $('<input/>').val("'");
	var ctrl = new window.ValidPass.Runner(input[0], ['punctuation']);
	
	ok(ctrl.result, "Passed!" );
});


test("Rule Test - min length - positive", function() {
	expect(1)
	var input = $('<input/>').val("6 long");
	var ctrl = new window.ValidPass.Runner(input[0], [new window.ValidPass.Rule("minchars", {"data-vp-minchars": 6})]);
	
	ok(ctrl.result, "Passed!" );
});

test("Rule Test - words - positive", function() {
	expect(1)
	var input = $('<input/>').val("bob eric sue sam");
	var ctrl = new window.ValidPass.Runner(input[0], [new window.ValidPass.Rule("minwords")]);
	
	ok(ctrl.result, "Passed!" );
});

test("Rule Test - words - negative", function() {
	expect(1)
	var input = $('<input/>').val("bob eric");
	var ctrl = new window.ValidPass.Runner(input[0], [new window.ValidPass.Rule("minwords")]);
	
	ok(!ctrl.result, "Passed!" );
});

test("Rule Test - words - negative (one empty word)", function() {
	expect(1)
	var input = $('<input/>').val("bob eric sue ");
	var ctrl = new window.ValidPass.Runner(input[0], [new window.ValidPass.Rule("minwords")]);
	
	ok(!ctrl.result, "Passed!" );
});

test("Rule Test - lowercase - negative", function() {
	expect(1)
	var input = $('<input/>').val("B");
	var ctrl = new window.ValidPass.Runner(input[0], ['lowercase']);
	
	ok(!ctrl.result, "Passed!" );
});


test("Rule Test - uppercase - negative", function() {
	expect(1)
	var input = $('<input/>').val("a");
	var ctrl = new window.ValidPass.Runner(input[0], ['uppercase']);
	
	ok(!ctrl.result, "Passed!" );
});

test("Rule Test - numbers - negative", function() {
	expect(1)
	var input = $('<input/>').val("one");
	var ctrl = new window.ValidPass.Runner(input[0], ['numbers']);
	
	ok(!ctrl.result, "Passed!" );
});

test("Rule Test - punctuation - negative", function() {
	expect(1)
	var input = $('<input/>').val("blah");
	var ctrl = new window.ValidPass.Runner(input[0], ['punctuation']);
	
	ok(!ctrl.result, "Passed!" );
});

test("Rule Test - min length - negative", function() {
	expect(1)
	var input = $('<input/>').val("short");
	var ctrl = new window.ValidPass.Runner(input[0], [new window.ValidPass.Rule("minchars", {"data-vp-minchars": 6})]);
	
	ok(!ctrl.result, "Passed!" );
});

test("Rule Test - multiple rules - positive", function() {
	expect(1)
	var input = $('<input/>').val("aaB12'@h");
	var ctrl = new window.ValidPass.Runner(input[0], ['lowercase', 'uppercase', 'numbers', 'punctuation', 'minchars']);
	
	ok(ctrl.result, "Passed!" );
});

test("Rule Test - multiple rules - negative", function() {
	expect(1)
	var input = $('<input/>').val("invalid");
	var ctrl = new window.ValidPass.Runner(input[0], ['lowercase', 'uppercase', 'numbers', 'punctuation', 'minchars']);
	
	ok(!ctrl.result, "Passed!" );
});

asyncTest("Validity status changes on input change", function(){
	expect(2);
	var isValid = false;
	var input = $('<input/>').val("a");
	var ctrl = new window.ValidPass.Runner(input[0], ['uppercase']);
	
	ctrl.registerCallback(function(result){
		ok(result === isValid, "Passed!" );
	});
	
	isValid = true;
	input.val("B");
	ctrl.run(input.val());
	start();
});

test("Test validation with no DOM - pass", function(){
	expect(5);
	var ctrl = new window.ValidPass.Runner(['uppercase']);
	ctrl.registerCallback(function(result, passes, fails) {
		ok(true); //callback should occur twice
	});
	ctrl.run("BOB");
	ok(ctrl.result);
	ok(ctrl.passes.length === 1);
	ok(ctrl.failures.length === 0);
});

test("Test validation with no DOM - fail", function(){
	expect(5);
	var ctrl = new window.ValidPass.Runner(['uppercase']);
	ctrl.registerCallback(function(result, passes, fails) {
		ok(true); //callback should occur twice
	});
	ctrl.run("bob");
	ok(!ctrl.result);
	ok(ctrl.passes.length === 0);
	ok(ctrl.failures.length === 1);
});


test("Differing rules failing depending on input value", function(){
	expect(12);
	var ctrl = new window.ValidPass.Runner(['uppercase', 'lowercase']);
	ok(ctrl.passes.length === 0);
	ok(ctrl.failures.length === 0);
	ok(!ctrl.result);
	
	ctrl.run("bob");
	ok(ctrl.passes.length === 1 && ctrl.passes[0].name === 'lowercase');
	ok(ctrl.failures.length === 1 && ctrl.failures[0].name === 'uppercase');
	ok(!ctrl.result);
	
	ctrl.run("BOB");
	ok(ctrl.passes.length === 1 && ctrl.passes[0].name === 'uppercase');
	ok(ctrl.failures.length === 1 && ctrl.failures[0].name === 'lowercase');
	ok(!ctrl.result);
	
	ctrl.run("Bob");
	ok(ctrl.passes.length === 2 && ctrl.passes[0].name === 'uppercase' && ctrl.passes[1].name === 'lowercase');
	ok(ctrl.failures.length === 0);
	ok(ctrl.result);
});

test("Attaching a custom rule via a rule definition", function(){
	window.ValidPass.RuleDefinitions.IsEqualToBob = function(attrs){
		return function(value) {
			return value === "Bob";
		};
	};
	
	var ctrl = new window.ValidPass.Runner(['IsEqualToBob']);
	var result = ctrl.run("bob");
	ok(!result);
	ctrl.run("Bob");
	ok(ctrl.result);
});

test("Attaching a custom rule via a rule definition - with attributes", function(){
	window.ValidPass.RuleDefinitions.IsEqualToValAttribute = function(attrs){
		return function(value) {
			return value === attrs['val'];
		};
	};
	
	var ctrl = new window.ValidPass.Runner([new window.ValidPass.Rule("IsEqualToValAttribute", {"val": 'bob'})]);
	ctrl.run("bob");
	ok(ctrl.result);
});

test("Attaching a custom rule via constructor", function(){
	var ctrl = new window.ValidPass.Runner([new window.ValidPass.Rule("minchars", {"data-vp-minchars": 6})]);
	ctrl.run("bob");
	ok(!ctrl.result);
	ctrl.run("bobbob");
	ok(ctrl.result);
});

test("DOM: input and list are recognised", function(){
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' "
		+ "data-vp-list = 'resultslist' />"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='lowercase'>Contains lowercase letters.</li>"
		+ "</ul>");
	
	$("body").append(dom);
	
	ok(window.ValidPass.Instances.length === 0);
	
	//Reset the script so it picks up the new DOM element
	window.ValidPass.ScanDOM();
	ok(window.ValidPass.Instances.length === 1);
	
	dom.remove();
	window.ValidPass.Dispose();
});

test("DOM: simple test fails initially", function(){
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' "
		+ "data-vp-list = 'resultslist' />"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='lowercase'>Contains lowercase letters.</li>"
		+ "</ul>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	ok(!window.ValidPass.Instances[0].result);
	
	dom.remove();
	window.ValidPass.Dispose();
});


test("DOM: simple test passes when new value is entered", function(){
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' "
		+ "data-vp-list = 'resultslist' />"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='lowercase'>Contains lowercase letters.</li>"
		+ "</ul>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	ok(!window.ValidPass.Instances[0].result); //should fail initially
	$("#password").val("bob");
	//run the test (we should really try to simulate the keyup event properly)
	window.ValidPass.Instances[0].inputHandler();
	
	ok(window.ValidPass.Instances[0].result);
	
	dom.remove();
	window.ValidPass.Dispose();
});


test("DOM: list-defined test with attributes", function(){
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' "
		+ "data-vp-list = 'resultslist' />"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='minchars' data-vp-minchars='3'>3 chars or more</li>"
		+ "</ul>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	ok(!window.ValidPass.Instances[0].result); //should fail initially
	$("#password").val("bob");
	window.ValidPass.Instances[0].inputHandler();
	ok(window.ValidPass.Instances[0].result);
	
	dom.remove();
	window.ValidPass.Dispose();
});


test("DOM: list-defined test with attributes - passes initially", function(){
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' value='bob' "
		+ "data-vp-list = 'resultslist' />"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='minchars' data-vp-minchars='3'>3 chars or more</li>"
		+ "</ul>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	ok(window.ValidPass.Instances[0].result);
	
	dom.remove();
	window.ValidPass.Dispose();
});


test("DOM: list-defined test with attributes - fails initially", function(){
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' value='mo' "
		+ "data-vp-list = 'resultslist' />"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='minchars' data-vp-minchars='3'>3 chars or more</li>"
		+ "</ul>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	ok(!window.ValidPass.Instances[0].result);
	
	dom.remove();
	window.ValidPass.Dispose();
});

test("DOM: list-defined test with attributes - test callbacks - pass", function(){
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' value='bob' "
		+ "data-vp-list = 'resultslist' />"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='minchars' data-vp-minchars='3'>3 chars or more</li>"
		+ "</ul>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	window.ValidPass.Instances[0].registerCallback(function(result, passes, failures){
		ok(result);
		ok(passes.length === 1);
		ok(failures.length === 0);
	});
	
	dom.remove();
	window.ValidPass.Dispose();
});

test("DOM: list-defined test with attributes - test callbacks - fail", function(){
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' value='mo' "
		+ "data-vp-list = 'resultslist' />"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='minchars' data-vp-minchars='3'>3 chars or more</li>"
		+ "</ul>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	window.ValidPass.Instances[0].registerCallback(function(result, passes, failures){
		ok(!result);
		ok(passes.length === 0);
		ok(failures.length === 1);
	});
	
	dom.remove();
	window.ValidPass.Dispose();
});

test("DOM: list-defined test with attributes - test hiding a label on fail", function(){
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' value='mo' "
		+ "data-vp-list = 'resultslist' data-vp-toggle = 'showhideme'/>"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='minchars' data-vp-minchars='3'>3 chars or more</li>"
		+ "</ul>"
		+ "<div id='showhideme'></div>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	ok(!$("#showhideme").is(":visible"));
	dom.remove();
	window.ValidPass.Dispose();
});


test("DOM: list-defined test with attributes - test showing a label on pass", function(){
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' value='bob' "
		+ "data-vp-list = 'resultslist' data-vp-toggle = 'showhideme'/>"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='minchars' data-vp-minchars='3'>3 chars or more</li>"
		+ "</ul>"
		+ "<div id='showhideme'></div>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	ok($("#showhideme").is(":visible"));
	dom.remove();
	window.ValidPass.Dispose();
});


test("DOM: list-defined test with attributes - test showing/hiding multiple labels", function(){
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' value='bob' "
		+ "data-vp-list = 'resultslist' data-vp-toggle = 'showhideme1, showhideme2'/>"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='minchars' data-vp-minchars='3'>3 chars or more</li>"
		+ "</ul>"
		+ "<div id='showhideme1'></div><div id='showhideme2'></div>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	ok($("#showhideme1").is(":visible"));
	ok($("#showhideme2").is(":visible"));
	$("#password").val("eh");
	window.ValidPass.Instances[0].inputHandler();
	ok(!$("#showhideme1").is(":visible"));
	ok(!$("#showhideme2").is(":visible"));
	dom.remove();
	window.ValidPass.Dispose();
});


test("DOM: list-defined test with attributes - applying a class", function(){
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' value='bob' "
		+ "data-vp-list = 'resultslist' data-vp-applyclass-to = 'elem' data-vp-applyclass-name='ok'/>"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='minchars' data-vp-minchars='3'>3 chars or more</li>"
		+ "</ul>"
		+ "<div id='elem'></div>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	ok($("#elem").hasClass("ok"));
	$("#password").val("eh");
	window.ValidPass.Instances[0].inputHandler();
	ok(!$("#elem").hasClass("ok"));
	dom.remove();
	window.ValidPass.Dispose();
});


test("DOM: list-defined test with attributes - applying different classes to different elements", function(){
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' value='bob' "
		+ "data-vp-list = 'resultslist' data-vp-applyclass-to = 'elem1,elem2' data-vp-applyclass-name='ok1,ok2'/>"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='minchars' data-vp-minchars='3'>3 chars or more</li>"
		+ "</ul>"
		+ "<div id='elem1'></div><div id='elem2'></div>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	ok($("#elem1").hasClass("ok1"));
	ok($("#elem2").hasClass("ok2"));
	$("#password").val("eh");
	window.ValidPass.Instances[0].inputHandler();
	ok(!$("#elem1").hasClass("ok1"));
	ok(!$("#elem2").hasClass("ok2"));
	dom.remove();
	window.ValidPass.Dispose();
});


test("DOM: list-defined test with attributes - removing a class when initially failing", function(){
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' value='mo' "
		+ "data-vp-list = 'resultslist' data-vp-applyclass-to = 'elem' data-vp-applyclass-name='ok'/>"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='minchars' data-vp-minchars='3'>3 chars or more</li>"
		+ "</ul>"
		+ "<div id='elem' class='ok'></div>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	ok(!$("#elem").hasClass("ok"));
	$("#password").val("bob");
	window.ValidPass.Instances[0].inputHandler();
	ok($("#elem").hasClass("ok"));
	dom.remove();
	window.ValidPass.Dispose();
});

test("DOM: list-defined test with attributes - applying a class when other classes are present on the element", function(){
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' value='bob' "
		+ "data-vp-list = 'resultslist' data-vp-applyclass-to = 'elem' data-vp-applyclass-name='ok'/>"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='minchars' data-vp-minchars='3'>3 chars or more</li>"
		+ "</ul>"
		+ "<div id='elem' class='red'></div>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	ok($("#elem").hasClass("ok"));
	ok($("#elem").hasClass("red"));
	$("#password").val("eh");
	window.ValidPass.Instances[0].inputHandler();
	ok(!$("#elem").hasClass("ok"));
	ok($("#elem").hasClass("red"));
	dom.remove();
	window.ValidPass.Dispose();
});


test("DOM: list-defined test with attributes - globally scoped callback attribute - initially passing", function(){
	window.cb = function(result, passes, fails) {
		ok(result);
	};
	
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' value='bob' "
		+ "data-vp-list = 'resultslist' data-vp-callback='cb'/>"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='minchars' data-vp-minchars='3'>3 chars or more</li>"
		+ "</ul>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	dom.remove();
	window.ValidPass.Dispose();
});

test("DOM: list-defined test with attributes - globally scoped callback attribute - initially failing then passing", function(){
	var count = 0;
	window.cb = function(result, passes, fails) {
		if(count === 0) {
			ok(!result); //first invocation
		} else {
			ok(result); //Second invocation
		}
	};
	
	//Create the DOM
	var dom = $("<input placeholder='Enter your password' type='password' id='password' name='password' value='mo' "
		+ "data-vp-list = 'resultslist' data-vp-callback='cb'/>"
		+ "<ul id='resultslist'>"
		+ "  <li data-vp-rule='minchars' data-vp-callback='cb'>3 chars or more</li>"
		+ "</ul>");
	$("body").append(dom);
	window.ValidPass.ScanDOM();
	$("#password").val("bob");
	window.ValidPass.Instances[0].inputHandler();
	dom.remove();
	window.ValidPass.Dispose();
});