
var LINQ = (function () {

	var LINQ = function (source, operations) {
		if (source.constructor === Array) {
			this._source = source;
		}
		else if (source.constructor === NodeList) {
			this._source = [];

			for (var i = 0, length = source.length; i < length; i++) {
				this._source.push(source[i]);
			}
		}
		
		this._operations = operations || [];
	};

	LINQ.prototype = {
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
		/// Returns a specified number of contiguous elements from the start of a sequence.
		take: function (count) {
			return deferred(this, {
				properties: {
					count: count
				},
				
				call: take
			});
		},
		/// Creates an array.
		toArray: function () {
			var array = this._source;

			// perform operations
			this._operations.forEach(function (operation) {
				array = operation.call(array, operation.properties);
			});

			return array;
		},
		/// Filters a sequence of values based on a predicate. Each element's index is used in the logic of the predicate function.
		/// predicate<element, int, boolean>
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
	
	function take(source, properties) {
		return source.slice(0, properties.count);
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