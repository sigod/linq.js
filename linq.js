
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
			throw new Error('Not supported source type!');
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
		constructor: LINQ, // for returning missed constructor after assigning object to prototype
		// Determines whether all elements of a sequence satisfy a condition.
		all: function (predicate) {
			return this.toArray().every(predicate);
		},

		any: function (predicate) {
			return this.count(predicate) > 0;
		},

		average: function (selector) {
			var list = this.toList();

			if (list.count() === 0) {
				throw new Error('The source sequence is empty.');
			}

			return list.sum(predicate) / list.count();
		},
		// Concatenates two sequences.
		concat: function (sequence) {
			return deferred(this, {
				properties: {
					sequence: new LINQ(sequence)
				},

				call: concat
			});
		},
		// Returns a number that represents how many elements in the specified sequence satisfy a condition.
		count: function (predicate) {
			return (predicate ? this.where(predicate) : this).toArray().length;
		},
		// Returns distinct elements from a sequence by using the default equality comparer to compare values.
		distinct: function () {
			return deferred(this, {
				properties: {},

				call: distinct
			});
		},
		first: function (predicate) {
			var first = this.firstOrDefault(predicate);

			if (first === null) {
				throw new Error('The source sequence is empty.');
			}

			return first;
		},
		// Returns the first element of the sequence that satisfies a condition or a default value if no such element is found.
		firstOrDefault: function (predicate) {
			return (predicate ? this.where(predicate) : this).toArray()[0] || null;
		},
		last: function (predicate) {
			var last = this.lastOrDefault(predicate);

			if (last === null) {
				throw new Error('The source sequence is empty.');
			}

			return last;
		},
		lastOrDefault: function (predicate) {
			var array = (predicate ? this.where(predicate) : this).toArray();

			return array[array.length - 1] || null;
		},
		// Returns a number that represents how many elements in the specified sequence satisfy a condition.
		longCount: function (predicate) {
			return this.count(predicate);
		},
		// Invokes a transform function on each element of a sequence and returns the maximum resulting value.
		max: function (selector) {
			var array = (selector ? this.select(selector) : this).toArray();

			if (array.length === 0) {
				throw new Error('The source sequence is empty.');
			}

			var max = array[0];

			array.forEach(function (e) {
				if (max < e) {
					max = e;
				}
			});

			return max;
		},
		// Invokes a transform function on each element of a sequence and returns the minimum resulting value.
		min: function (selector) {
			var array = (selector ? this.select(selector) : this).toArray();

			if (array.length === 0) {
				throw new Error('The source sequence is empty.');
			}

			var min = array[0];

			array.forEach(function (e) {
				if (min > e) {
					min = e;
				}
			});

			return min;
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

		sum: function (selector) {
			var array = selector
				? this.select(selector).toArray()
				: this.toArray();

			var sum = 0;

			array.forEach(function (e) {
				sum += e;
			});

			return sum;
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

		toList: function () {
			return new LINQ(this.toArray());
		},
		// Filters a sequence of values based on a predicate. Each element's index is used in the logic of the predicate function.
		// predicate<element, int, boolean>
		where: function (predicate) {
			if (typeof predicate !== 'function') {
				throw new Error('predicate must be a function.');
			}

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
	
	function concat(source, properties) {
		var result = [];

		source.forEach(function (e) {
			result.push(e);
		});

		properties.sequence.toArray().forEach(function (e) {
			result.push(e);
		});

		return result;
	}

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