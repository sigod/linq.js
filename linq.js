
var LINQ = (function () {

	var LINQ = function (source, operations) {
		if (source.constructor === Array) {
			this._source = source;
		}
		else if (source.constructor === LINQ) {
			return source;
		}
		else if (source.constructor === NodeList
			|| source.constructor === HTMLSelectElement) {
			this._source = [];

			for (var i = 0, length = source.length; i < length; i++) {
				this._source.push(source[i]);
			}
		}
		else {
			if (console) console.error('LINQ: not supported source type!');
		}
		
		this._operations = operations || [];
	};

	// Generates a sequence of integral numbers within a specified range.
	LINQ.range = function (start, count) {
		return new LINQ([], [{
			properties: {
				start: start,
				count: count
			},

			call: range
		}]);
	};

	// Generates a sequence that contains one repeated value.
	LINQ.repeat = function (element, count) {
		return new LINQ([], [{
			properties: {
				element: element,
				count: count
			},

			call: repeat
		}]);
	};

	LINQ.prototype = {
		// Returns distinct elements from a sequence by using the default equality comparer to compare values.
		distinct: function () {
			return deferred(this, {
				properties: {},

				call: distinct
			});
		},
		// Inverts the order of the elements in a sequence.
		reverse: function () {
			return deferred(this, {
				properties: {},

				call: reverse
			});
		},
		// Projects each element of a sequence into a new form by incorporating the element's index.
		// predicate<element, index, result>
		select: function (predicate) {
			return deferred(this, {
				properties: {
					predicate: predicate
				},

				call: select
			});
		},
		// Bypasses a specified number of elements in a sequence and then returns the remaining elements.
		skip: function (count) {
			return deferred(this, {
				properties: {
					count: count
				},

				call: skip
			});
		},
		// Bypasses elements in a sequence as long as a specified condition is true and then returns the remaining elements. The element's index is used in the logic of the predicate function.
		// predicate<element, index, boolean>
		skipWhile: function (predicate) {
			return deferred(this, {
				properties: {
					predicate: predicate
				},

				call: skipWhile
			});
		},
		// Returns a specified number of contiguous elements from the start of a sequence.
		take: function (count) {
			return deferred(this, {
				properties: {
					count: count
				},
				
				call: take
			});
		},
		// Returns elements from a sequence as long as a specified condition is true. The element's index is used in the logic of the predicate function.
		// predicate<element, index, boolean>
		takeWhile: function (predicate) {
			return deferred(this, {
				properties: {
					predicate: predicate
				},

				call: takeWhile
			});
		},
		// Creates an array.
		toArray: function () {
			var array = this._source;

			// perform operations
			this._operations.forEach(function (operation) {
				array = operation.call(array, operation.properties);
			});

			return array;
		},
		// Filters a sequence of values based on a predicate. Each element's index is used in the logic of the predicate function.
		// predicate<element, int, boolean>
		where: function (predicate) {
			return deferred(this, {
				properties: {
					predicate: predicate
				},

				call: where
			});
		}
	};

	return LINQ;

	/*
	 *	Deferred execution
	 */
	
	function distinct(source, properties) {
		var array = [];

		var flags = LINQ.repeat(true, source.length).toArray();

		for (var i = 0, length = source.length; i < length; i++) {
			if (!flags[i]) { continue; }

			for (var j = i + 1; j < length; j++) {
				if (!flags[j]) { continue; }

				if (source[i] === source[j]) {
					flags[j] = false;
				}
			}

			array.push(source[i]);
		}

		return array;
	}
	
	function range(source, properties) {
		var array = [];

		for (var i = 0; i < properties.count; i++) {
			array.push(i + properties.start);
		}

		return array;
	}
	
	function repeat(source, properties) {
		var array = [];

		for (var i = 0; i < properties.count; i++) {
			array.push(properties.element);
		}

		return array;
	}

	function reverse(source) {
		return source.reverse();
	}
	
	function select(source, properties) {
		var result = [];

		source.forEach(function (e, i) {
			result.push(properties.predicate(e, i));
		});

		return result;
	}
	
	function skip(source, properties) {
		return source.slice(properties.count);
	}

	function skipWhile(source, properties) {
		var array = [];

		source.forEach(function (e, i) {
			each(e, i);
		});

		return array;


		function each(e, i) {
			if (!properties.predicate(e, i)) {
				each = function (e) {
					array.push(e);
				}
			}
		}
	}
	
	function take(source, properties) {
		return source.slice(0, properties.count);
	}
	
	function takeWhile(source, properties) {
		var array = [];

		for (var i = 0, length = source.length; i < length; i++) {
			if (!properties.predicate(source[i], i)) {
				break;
			}

			array.push(source[i]);
		}

		return array;
	}

	function where(source, properties) {
		return source.filter(properties.predicate);
	}

	/*
	 *	Utils
	 */

	// for easy creating functions of deferred execution
	function deferred(linq, add) {
		var cloned = [];

		linq._operations.forEach(function (operation) {
			cloned.push(operation);
		});

		cloned.push(add);

		return new LINQ(linq._source, cloned);
	}

})();