
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

		aggregate: function (seed, func, resultSelector) {
			if (typeof func !== 'function') {
				throw new Error('func must be a function.');
			}
			if (typeof resultSelector !== 'function') {
				resultSelector = function (e) { return e; };
			}

			var accumulate = seed;

			this.toArray().forEach(function (e) {
				accumulate = func(accumulate, e);
			});

			return resultSelector(accumulate);
		},
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
			if (!sequence) {
				throw new Error('sequence can not be null');
			}

			return deferred(this, {
				properties: {
					sequence: new LINQ(sequence)
				},

				call: concat
			});
		},

		contains: function (value) {
			var array = this.toArray();

			for (var i = 0, length = array.length; i < length; i++) {
				if (array[i] === value) {
					return true;
				}
			}

			return false;
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

		elementAt: function (index) {
			var element = this.elementAtOrDefault(index);

			if (element === null) {
				throw new Error('No element at that index.');
			}

			return element;
		},

		elementAtOrDefault: function (index) {
			var array = this.toArray();

			return array[index] || null;
		},

		except: function (sequence) {
			if (!sequence) {
				throw new Error('sequence can not be null');
			}

			return deferred(this, {
				properties: {
					sequence: new LINQ(sequence)
				},

				call: except
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

		groupJoin: function (inner, outerKeySelector, innerKeySelector, resultSelector) {
			if (!inner) {
				throw new Error('inner can not be null');
			}
			if (typeof outerKeySelector !== 'function') {
				throw new Error('outerKeySelector must be a function.');
			}
			if (typeof innerKeySelector !== 'function') {
				throw new Error('innerKeySelector must be a function.');
			}
			if (typeof resultSelector !== 'function') {
				throw new Error('resultSelector must be a function.');
			}

			return deferred(this, {
				properties: {
					inner: new LINQ(inner),
					outerKeySelector: outerKeySelector,
					innerKeySelector: innerKeySelector,
					resultSelector: resultSelector
				},

				call: groupJoin
			});
		},

		intersect: function(sequence) {
			if (!sequence) {
				throw new Error('sequence can not be null');
			}

			return deferred(this, {
				properties: {
					sequence: new LINQ(sequence)
				},

				call: intersect
			});
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

		sequenceEqual: function (sequence) {
			if (!sequence) {
				throw new Error('sequence can not be null');
			}

			var first = this.toArray();
			var second = (new LINQ(sequence)).toArray();

			if (first.length !== second.length) {
				return false;
			}

			for (var i = 0, length = first.length; i < length; i++) {
				if (first[i] !== second[i]) {
					return false;
				}
			}

			return false;
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

		toDictionary: function (keySelector, elementSelector) {
			if (typeof keySelector !== 'function') {
				throw new Error('keySelector must be a function.');
			}
			if (typeof elementSelector !== 'function') {
				elementSelector = function (e) { return e; };
			}

			var result = {};

			this.toArray().forEach(function (e) {
				var key = keySelector(e);

				if (result[key]) {
					throw new Error('keySelector produces duplicate keys for two elements.');
				}

				result[key] = elementSelector(e);
			});

			return result;
		},

		toList: function () {
			return new LINQ(this.toArray());
		},

		toLookup: function (keySelector, elementSelector) {
			if (typeof keySelector !== 'function') {
				throw new Error('keySelector must be a function.');
			}
			if (typeof elementSelector !== 'function') {
				elementSelector = function (e) { return e; };
			}

			var result = {};

			this.toArray().forEach(function (e) {
				var key = keySelector(e);

				if (!result[key]) {
					result[key] = [];
				}

				result[key].push(elementSelector(e));
			});

			return result;
		},

		union: function (sequence) {
			return this.concat(sequence).distinct();
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
		},

		zip: function (sequence, resultSelector) {
			if (!sequence) {
				throw new Error('sequence can not be null');
			}
			if (typeof resultSelector !== 'function') {
				throw new Error('resultSelector must be a function.');
			}

			return deferred(this, {
				properties: {
					sequence: new LINQ(sequence),
					resultSelector: resultSelector
				},

				call: zip
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

	function except(source, properties) {
		var result = [];

		source.forEach(function (e) {
			if (!properties.sequence.contains(e)) {
				result.push(e);
			}
		});

		return result;
	}

	function groupJoin(source, properties) {
		var inner = properties.inner.toLookup(properties.innerKeySelector);

		var result = [];

		select(source, {
			predicate: function (e) {
				return {
					key: properties.outerKeySelector(e),
					element: e
				};
			}
		}).forEach(function (e) {
			result.push(properties.resultSelector(e.element, inner[e.key] || []));
		})

		return result;
	}

	function intersect(source, properties) {
		var result = [];

		source.forEach(function (e) {
			if (properties.sequence.contains(e)) {
				result.push(e);
			}
		});

		return result;
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

	function zip(source, properties) {
		var result = [];

		var second = properties.sequence.toArray();

		for (var i = 0, length = min(source.length, second.length); i < length; i++) {
			result.push(properties.resultSelector(source[i], second[i]));
		}

		return result;
	}

	/*
	 *	Utils
	 */
	
	function min(a, b) {
		return a < b ? a : b;
	}

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