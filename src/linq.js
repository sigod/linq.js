
var LINQ = exports.LINQ = function (source, operations) {
	if (!(this instanceof LINQ)) return new LINQ(source, operations);

	if (is('Array', source)) {
		this._source = source;
	}
	else if (is('Object', source) && source._isLINQ === true)
	{
		return source;
	}
	else {
		throw new Error('Not supported source type!');
	}
	
	this._operations = operations || [];
};

LINQ.range = function (start, count) {
	var array = [];

	for (var i = start, end = start + count; i < end; ++i) {
		array.push(i);
	}

	return new LINQ(array);
};

LINQ.repeat = function (element, count) {
	var array = [];

	for (var i = 0; i < count; ++i) {
		array.push(element);
	}

	return new LINQ(array);
};
