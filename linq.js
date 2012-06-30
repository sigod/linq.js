
var LINQ = (function () {

	var LINQ = function (source, operations) {
		this._source = source;
		this._operations = operations || [];
	};

	LINQ.prototype = {
		/// Returns a specified number of contiguous elements from the start of a sequence.
		take: function (count) {
			return deferred(this, {
				properties: {
					count: count
				},
				
				call: function (source, properties) {
					return source.slice(0, properties.count);
				}
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

				call: function (source, properties) {
					return source.filter(properties.predicate);
				}
			});
		}
	};

	return LINQ;

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