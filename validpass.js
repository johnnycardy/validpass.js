(function() {

	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(obj, start) {
			 for (var i = (start || 0), j = this.length; i < j; i++) {
				 if (this[i] === obj) { return i; }
			 }
			 return -1;
		}
	}
	
	if (!String.prototype.trim) {
		String.prototype.trim = function () {
			return this.replace(/^\s+|\s+$/g, '');
		};
	}
	
	window.ValidPass = {
		className: 'complete',
		minChars: 8,
		minWords: 4
	};

	function handleEvent(elem, eventName, handler) {
		if(elem.addEventListener) {
			elem.addEventListener(eventName, handler, false);
		}
	}
	
	function unhandleEvent(elem, eventName, handler) {
		if(elem.removeEventListener) {
			elem.removeEventListener(eventName, handler);
		}
	}
	
	function addClass(elem, newClassName) {
		//Get the class list
		var classes = elem.className ? elem.className.split(" ") : [];
		if(classes.indexOf(newClassName) === -1) {
			classes.push(newClassName);
			elem.className = classes.join(" ");
		}
	}
	
	function removeClass(elem, oldClassName) {
		var classes = elem.className ? elem.className.split(" ") : [],
			index = classes.indexOf(oldClassName);
		
		if(index >= 0) {
			classes.splice(index, 1);
			elem.className = classes.join(" ");
		}
	}
	
	window.ValidPass.Instances = [];
	
	window.ValidPass.Dispose = function(){
		var instances = window.ValidPass.Instances;
		for(var i=0; i<instances.length; i++) {
			instances[i].dispose();
		}
		window.ValidPass.Instances.length = 0;
	};
	
	window.ValidPass.ScanDOM = function(){
		//Get all the password input elements
		var passwordInputs = document.querySelectorAll("[data-vp-list]");
		for(var i=0; i<passwordInputs.length; i++) {
			var validPassCtrl = new window.ValidPass.Runner(passwordInputs[i]);
			//Record instances so they can be accessed later
			window.ValidPass.Instances.push(validPassCtrl);
		}
	};
	
	handleEvent(window, 'load', window.ValidPass.ScanDOM);
	
	//Call either: new Rule("rulename", [attributes]);
	//	or 		   new Rule(listItemElement);
	window.ValidPass.Rule = function(ruleNameOrLi, attributes){
		if(ruleNameOrLi !== undefined) {
			if(typeof ruleNameOrLi === "string") {
				this.name = ruleNameOrLi;
				this.attributes = attributes || {};
			} else {
				this.listItemElem = ruleNameOrLi;
				this.name = this.listItemElem.attributes["data-vp-rule"] ? this.listItemElem.attributes["data-vp-rule"].value : "";
				this.attributes = this.listItemElem.attributes;
			}
		}
	};
	
	window.ValidPass.Rule.prototype.run = function(value){
		var result = this._getFunc(this.name)(value);
		
		if(this.listItemElem) {
			if(result)
				addClass(this.listItemElem, window.ValidPass.className);
			else
				removeClass(this.listItemElem, window.ValidPass.className);
		}
		
		return result;
	};
	
	window.ValidPass.Rule.prototype._getFunc = function(id) {
		if(!this._func) {
			if(window.ValidPass.RuleDefinitions[id]) {
				this._func = window.ValidPass.RuleDefinitions[id](this.attributes);
			}
		}
		
		return this._func || function(){ return true; };
	};	
	
	window.ValidPass.RuleDefinitions = {
		'minchars' : function(inputElemAttrbutes) {
			//Get the min length specified on the input element
			var minChars = window.ValidPass.minChars;
			var attr = inputElemAttrbutes["data-vp-minchars"];
			if(attr) {
				minChars = Number(attr.value === undefined ? attr : attr.value);
			}
			return function(value) {
				return value.length >= minChars;
			};
		},
		'uppercase' : function(inputElemAttrbutes) {
			return function(value) {
				return /[A-Z]/.test(value);
			};
		},
		'lowercase' : function(inputElemAttrbutes) {
			return function(value) {
				return /[a-z]/.test(value);
			};
		},
		'numbers' : function(inputElemAttrbutes) {
			return function(value) {
				return /[0-9]/.test(value);
			};
		},
		'punctuation' : function(inputElemAttrbutes) {
			return function(value) {
				return /[^\w\s]|_/.test(value);
			};
		},
		'minwords' : function(inputElemAttrbutes) {
			var minWords = window.ValidPass.minWords;
			var attr = inputElemAttrbutes["data-vp-minwords"];
			if(attr) {
				minWords = Number(attr.value === undefined ? attr : attr.value);
			}
			return function(value) {
				var words = value.split(' ', minWords);
				if(words.length >= minWords) {
					//Make sure none of the words are non-empty
					for(var i=0; i<words.length; i++) {
						if(!words[i]) return false;
					}
					return true;
				} else {
					return false;
				}
			};
		}
	};
	
	
	//Constructor for the main control
	window.ValidPass.Runner = function(arg1, arg2){
		var me = this;
		this.toggleElems = [];
		this.applyClasses = {};
		this._callbacks = [];
		this.result = null;
		this.passes = [];
		this.failures = [];
		
		//Both arguments are optional, so test by whether the first is an array.
		if (arg1 instanceof Array) {
			this.rules = arg1;
			this.inputElem = null;
		} else {
			this.inputElem = arg1;
			this.rules = arg2 || [];
		}
		
		//If any of the rules are string rule names, then instantiate the actual objects.
		for(var i=0; i<this.rules.length; i++) {
			if(typeof this.rules[i] === "string") {
				this.rules[i] = new window.ValidPass.Rule(this.rules[i]);
			}
		}
		
		this.setDOMInputElement(this.inputElem);
	};
	
	window.ValidPass.Runner.prototype.setDOMInputElement = function(inputElem) {
		var me = this;
		//Get the relevant list if we're operating on the dom
		if(inputElem) {
			this.inputElem = inputElem;
			
			if(this.inputElem.attributes["data-vp-list"]) {
				var listId = this.inputElem.attributes["data-vp-list"].value;
				if(listId) {
					var listElem = document.getElementById(listId);
					if(listElem) {
						//Set up a rule for each list item
						for(var i=0; i<listElem.children.length; i++) {
							var rule = new window.ValidPass.Rule(listElem.children[i]);
							this.rules.push(rule);
						}
					}
				}
			}
		
			//Check for a label to toggle
			if(this.inputElem.attributes["data-vp-toggle"]) {
				var ids = this.inputElem.attributes["data-vp-toggle"].value.split(',');
				for(var i=0; i<ids.length; i++) {
					var toggleElem = document.getElementById(ids[i].trim());
					if(toggleElem) {
						this.toggleElems.push(toggleElem);
					}
				}
			}
			
			//Check for elements that should get a class applied to them
			if(this.inputElem.attributes["data-vp-applyclass-to"] && this.inputElem.attributes["data-vp-applyclass-name"]) {
				var ids = this.inputElem.attributes["data-vp-applyclass-to"].value.split(','),
					classNames = this.inputElem.attributes["data-vp-applyclass-name"].value.split(',');
					
				if(ids.length && classNames.length) {			
					for(var i=0; i<ids.length; i++) {
						var elem = document.getElementById(ids[i]);
						if(elem) {
							var className = classNames[i] || classNames[classNames.length - 1];
							if(className) {
								this.applyClasses[className] = this.applyClasses[className] || [];
								this.applyClasses[className].push(elem);
							}
						}
					}
				}
			}
			
			this.inputHandler = function(){
				me.run(me.inputElem.value);
			};
			
			//Listen for changes to the input value, and run the rules
			handleEvent(this.inputElem, 'keyup', this.inputHandler);
			
			//Run the rules for the first time
			me.run(this.inputElem.value);
			
			//Check for a callback attribute in the input element
			if(this.inputElem.attributes["data-vp-callback"]) {
				var cb = this.inputElem.attributes["data-vp-callback"].value;
				if(cb) {
					if(cb.indexOf("function") === 0) {
						//todo: parse it and add it to the callbacks
					} else if (window[cb]) {
						//If it's a global function, then add it directly to the callbacks
						this.registerCallback(window[cb]);
					}
				}
			}
		}
	};
	
	window.ValidPass.Runner.prototype.dispose = function(){
		unhandleEvent(this.inputElem, 'keyup', this.inputHandler);
	};
	
	window.ValidPass.Runner.prototype.run = function(value) {
		var result = true;
		
		this.passes = [];
		this.failures = [];
			
		for(var i=0; i<this.rules.length; i++) {
			var ruleResult = this.rules[i].run(value);
			result = result && ruleResult;
			
			//Store what passed and what failed, for the callback later on.
			(ruleResult ? this.passes : this.failures).push(this.rules[i]);
		}
		
		//Toggle the toggleElems
		for(var i=0; i<this.toggleElems.length; i++) {
			this.toggleElems[i].style.display = result ? "" : "none";
		}
		
		//Apply classes
		for(var className in this.applyClasses) {
			if(this.applyClasses.hasOwnProperty(className)) {
				var elems = this.applyClasses[className];
				for(var i=0; i<elems.length; i++) {
					if(result) {
						addClass(elems[i], className);
					} else {
						removeClass(elems[i], className);
					}
				}
			}
		}
		
		this.result = result;
		//Raise callbacks for any listeners
		this._doCallback();
		
		return result;
	};
	
	window.ValidPass.Runner.prototype.registerCallback = function(callback) {
		this._callbacks.push(callback);
		//Call the callback with the current result
		callback(this.result, this.passes, this.failures);
	};
	
	window.ValidPass.Runner.prototype._doCallback = function() {
		for(var i=0; i<this._callbacks.length; i++) {
			this._callbacks[i](this.result, this.passes, this.failures);
		}
	};
	
})();
