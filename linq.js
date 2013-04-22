/*!
 * linq.js 1.0.0
 * https://github.com/sigod/linq.js
 *
 * Licensed under the MIT license.
 * http://opensource.org/licenses/MIT
 */

; var LINQ = (function () {
	"use strict";

	var LINQ = function (source, operations) {
		if (!source) {
			throw new Error('source can not be null');
		}

		if (Object.prototype.toString.call(source) === '[object Array]') {
			this._source = source;
		}
		else if (Object.prototype.toString.call(source) === '[object Object]'
			&& source._isLINQ === true)
		{
			return source;
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

		_isLINQ: true,

		aggregate: function (seed, func, resultSelector) {
			if (typeof func !== 'function') {
				throw new Error('func must be a function.');
			}
			if (typeof resultSelector !== 'function') {
				resultSelector = defaultSelector;
			}

			var accumulate = seed;

			var array = this.toArray();

			for (var i = 0, length = array.length; i < length; ++i) {
				accumulate = func(accumulate, array[i]);
			}

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

			for (var i = 0, length = array.length; i < length; ++i) {
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

		groupBy: function (keySelector, elementSelector, resultSelector) {
			if (typeof keySelector !== 'function') {
				throw new Error('keySelector must be a function.');
			}

			return deferred(this, {
				properties: {
					keySelector: keySelector,
					elementSelector: elementSelector,
					resultSelector: resultSelector
				},

				call: groupBy
			});
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

		join: function (inner, outerKeySelector, innerKeySelector, resultSelector) {
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

				call: join
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

			for (var i = array.length; i--;) {
				if (max < array[i]) {
					max = array[i];
				}
			}

			return max;
		},
		// Invokes a transform function on each element of a sequence and returns the minimum resulting value.
		min: function (selector) {
			var array = (selector ? this.select(selector) : this).toArray();

			if (array.length === 0) {
				throw new Error('The source sequence is empty.');
			}

			var min = array[0];

			for (var i = array.length; i--;) {
				if (min > array[i]) {
					min = array[i];
				}
			}

			return min;
		},

		orderBy: function (keySelector, comparer) {
			if (typeof keySelector !== 'function') {
				throw new Error('keySelector must be a function.');
			}

			var operations = this._operations.slice();

			if (typeof comparer !== 'function') {
				comparer = defaultComparer;
			}

			operations.push({
				properties: {
					keySelector: keySelector,
					comparer: comparer
				},

				call: orderBy
			});

			return new OrderedLINQ(this._source, operations);
		},

		orderByDescending: function (keySelector) {
			return this.orderBy(keySelector, function (a, b) { return defaultComparer(b, a); });
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

		selectMany: function (collectionSelector, resultSelector) {
			if (typeof collectionSelector !== 'function') {
				throw new Error('collectionSelector must be a function.');
			}
			if (typeof resultSelector !== 'function') {
				throw new Error('resultSelector must be a function.');
			}

			return deferred(this, {
				properties: {
					collectionSelector: collectionSelector,
					resultSelector: resultSelector
				},

				call: selectMany
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

			for (var i = 0, length = first.length; i < length; ++i) {
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

			for (var i = array.length; i--;) {
				sum += array[i];
			}

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
			for (var i = 0, length = this._operations.length; i < length; ++i) {
				array = this._operations[i].call(array, this._operations[i].properties);
			}

			return array;
		},

		toDictionary: function (keySelector, elementSelector) {
			if (typeof keySelector !== 'function') {
				throw new Error('keySelector must be a function.');
			}
			if (typeof elementSelector !== 'function') {
				elementSelector = defaultSelector;
			}

			var result = {};
			var array = this.toArray();

			for (var i = 0, length = array.length; i < length; ++i) {
				var key = keySelector(array[i]);

				if (result[key]) {
					throw new Error('keySelector produces duplicate keys for two elements.');
				}

				result[key] = elementSelector(array[i]);
			}

			return result;
		},

		toList: function () {
			return new LINQ(this.toArray());
		},

		toLookup: function (keySelector, elementSelector) {
			if (typeof keySelector !== 'function') {
				throw new Error('keySelector must be a function.');
			}

			return toLookup(this.toArray(), keySelector, elementSelector);
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

	/*
	 *	Provide thenBy and thenByDescending functionality.
	 */

	function OrderedLINQ(source, operations) {
		this._source = source;
		this._operations = operations;
	};

	OrderedLINQ.prototype = new LINQ([]);

	OrderedLINQ.prototype.thenBy = function (keySelector, comparer) {
		if (typeof keySelector !== 'function') {
			throw new Error('keySelector must be a function.');
		}

		var cloned = this._operations.slice();
		var last = cloned[cloned.length - 1];

		if (typeof comparer !== 'function') {
			comparer = defaultComparer;
		}

		last.properties.thenBy = {
			keySelector: keySelector,
			comparer: comparer
		};

		last.call = thenBy;

		return new OrderedLINQ(this._source, cloned);
	};

	OrderedLINQ.prototype.thenByDescending = function (keySelector) {
		return this.thenBy(keySelector, function (a, b) { return defaultComparer(b, a); });
	};

	return LINQ;

	/*
	 *	Deferred execution
	 */
	
	function concat(source, properties) {
		var result = [];

		for (var i = 0, length = source.length; i < length; ++i) {
			result.push(source[i]);
		}

		var array = properties.sequence.toArray();
		for (var i = 0, length = array.length; i < length; ++i) {
			result.push(array[i]);
		}

		return result;
	}

	function distinct(source, properties) {
		var array = [];

		var flags = LINQ.repeat(true, source.length).toArray();

		for (var i = 0, length = source.length; i < length; ++i) {
			if (!flags[i]) { continue; }

			for (var j = i + 1; j < length; ++j) {
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

		for (var i = 0; i < properties.count; ++i) {
			array.push(i + properties.start);
		}

		return array;
	}
	
	function repeat(source, properties) {
		var array = [];

		for (var i = 0; i < properties.count; ++i) {
			array.push(properties.element);
		}

		return array;
	}

	function except(source, properties) {
		var result = [];

		for (var i = 0, length = source.length; i < length; ++i) {
			if (!properties.sequence.contains(array[i])) {
				result.push(array[i]);
			}
		}

		return result;
	}

	function groupBy(source, properties) {
		var result = [];

		if (typeof properties.resultSelector !== 'function') {
			properties.resultSelector = function (key, linq) { linq.key = key; return linq; };
		}

		var lookup = toLookup(source, properties.keySelector, properties.elementSelector);

		for (var key in lookup) {
			result.push(properties.resultSelector(key, new LINQ(lookup[key])));
		}

		return result;
	}

	function groupJoin(source, properties) {
		var inner = properties.inner.toLookup(properties.innerKeySelector);

		var result = [];

		for (var i = 0, length = source.length; i < length; ++i) {
			var key = properties.outerKeySelector(source[i]);

			result.push(properties.resultSelector(source[i], inner[key] || []));
		}

		return result;
	}

	function intersect(source, properties) {
		var result = [];

		for (var i = 0, length = source.length; i < length; ++i) {
			if (properties.sequence.contains(source[i])) {
				result.push(source[i]);
			}
		}

		return result;
	}

	function join(source, properties) {
		var inner = properties.inner.toLookup(properties.innerKeySelector);

		var result = [];

		for (var i = 0, ii = source.length; i < ii; ++i) {
			var key = properties.outerKeySelector(source[i]);

			var inner_key = inner[key];
			if (!inner_key) continue;

			for (var j = 0, jj = inner_key.length; j < jj; ++j) {
				result.push(properties.resultSelector(source[i], inner_key[j]));
			}
		}

		return result;
	}

	function orderBy(source, properties) {
		// we should clone source because sort changes array
		return source.slice().sort(function (a, b) {
			return properties.comparer(
				properties.keySelector(a),
				properties.keySelector(b)
			);
		});
	}

	function reverse(source) {
		return source.reverse();
	}
	
	function select(source, properties) {
		var result = [];

		for (var i = 0, length = source.length; i < length; ++i) {
			result.push(properties.predicate(source[i], i));
		}

		return result;
	}

	function selectMany(source, properties) {
		var result = [];

		for (var i = 0, ii = source.length; i < ii; ++i) {
			var collection = properties.collectionSelector(source[i], i);
			var array = (new LINQ(collection)).toArray();

			for (var j = 0, jj = array.length; j < jj; ++j) {
				result.push(properties.resultSelector(source[i], array[j]));
			}
		}

		return result;
	}
	
	function skip(source, properties) {
		return source.slice(properties.count);
	}

	function skipWhile(source, properties) {
		var array = [];

		var length = source.length;
		for (var i = 0; i < length; ++i) {
			if (!properties.predicate(source[i], i))
				break;
		}

		for (; i < length; ++i) {
			array.push(source[i]);
		}

		return array;
	}
	
	function take(source, properties) {
		return source.slice(0, properties.count);
	}
	
	function takeWhile(source, properties) {
		var array = [];

		for (var i = 0, length = source.length; i < length; ++i) {
			if (!properties.predicate(source[i], i)) {
				break;
			}

			array.push(source[i]);
		}

		return array;
	}

	function thenBy(source, properties) {
		return source.slice().sort(function (a, b) {
			var compare = properties.comparer(
				properties.keySelector(a),
				properties.keySelector(b)
			);

			if (compare === 0) {
				compare = properties.thenBy.comparer(
					properties.thenBy.keySelector(a),
					properties.thenBy.keySelector(b)
				);
			}

			return compare;
		});
	}

	// defined here for using in two places
	function toLookup(source, keySelector, elementSelector) {
		if (typeof elementSelector !== 'function') {
			elementSelector = defaultSelector;
		}

		var result = {};

		for (var i = 0, length = source.length; i < length; ++i) {
			var key = keySelector(source[i]);

			if (!result[key]) {
				result[key] = [];
			}

			result[key].push(elementSelector(source[i]));
		}

		return result;
	}

	function where(source, properties) {
		return source.filter(properties.predicate);
	}

	function zip(source, properties) {
		var result = [];

		var second = properties.sequence.toArray();

		for (var i = 0, length = min(source.length, second.length); i < length; ++i) {
			result.push(properties.resultSelector(source[i], second[i]));
		}

		return result;
	}

	/*
	 *	Utils
	 */
	
	function defaultSelector(e) {
		return e;
	}

	function defaultComparer(a, b) {
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	}

	function min(a, b) {
		return a < b ? a : b;
	}

	// for easy creating functions of deferred execution
	function deferred(linq, add) {
		var cloned = linq._operations.slice();

		cloned.push(add);

		return new LINQ(linq._source, cloned);
	}

}());