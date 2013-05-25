
/*
 *	Provide thenBy and thenByDescending functionality.
 */

function OrderedLINQ(source, operations) {
	this._source = source;
	this._operations = operations;
};

OrderedLINQ.prototype = new LINQ([]);

OrderedLINQ.prototype.thenBy = function (keySelector, comparer) {
	var cloned = this._operations.slice();
	var last = cloned[cloned.length - 1];

	last.properties.thenBy = {
		keySelector: toFunction(keySelector),
		comparer: toFunction(comparer, defaultComparer)
	};

	last.call = thenBy;

	return new OrderedLINQ(this._source, cloned);
};

OrderedLINQ.prototype.thenByDescending = function (keySelector, comparer) {
	return this.thenBy(keySelector, comparer).reverse();
};
