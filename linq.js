
var LINQ = (function () {

	var LINQ = function (source, operations) {
		this._source = source;
		this._operations = operations || [];
	};

	LINQ.prototype = {
		/// Returns a specified number of contiguous elements from the start of a sequence.
		take: function (count) {
			var operations = [];

			this._operations.forEach(function (operation) {
				operations.push(operation);
			});

			operations.push({
				name: 'take',
				count: count
			});

			return new LINQ(this._source, operations);
		},
		/// Creates an array.
		toArray: function () {
			var self = this;

			var array = this._source;

			// perform operations
			this._operations.forEach(function (operation) {
				if (operation.name === 'where') {
					array = array.filter(function (element, index) {
						return operation.predicate(element, index);
					});
				}
			});

			return array;
		},
		/// Filters a sequence of values based on a predicate. Each element's index is used in the logic of the predicate function.
		/// predicate<element, int, boolean>
		where: function (predicate) {
			var operations = [];

			this._operations.forEach(function (operation) {
				operations.push(operation);
			});

			operations.push({
				name: 'where',
				predicate: predicate
			});

			return new LINQ(this._source, operations);
		}
	};

	return LINQ;

})();