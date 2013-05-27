
LINQ.prototype = new AbstractLINQ();

LINQ.prototype.aggregate = function (seed, func, resultSelector) {
	func = toFunction(func);

	var accumulate = seed,
		array = this.toArray();

	for (var i = 0, length = array.length; i < length; ++i) {
		accumulate = func(accumulate, array[i]);
	}

	return toFunction(resultSelector, defaultSelector)(accumulate);
};

LINQ.prototype.all = function (predicate) {
	return this.toArray().every(toFunction(predicate));
};

LINQ.prototype.any = function (predicate) {
	return this.toArray().some(toFunction(predicate));
};

LINQ.prototype.average = function (predicate) {
	var list = this.toList(),
		count = list.count(predicate);

	if (count === 0) {
		throw new Error('The source sequence is empty.');
	}

	return list.sum(predicate) / count;
};

LINQ.prototype.concat = function (sequence) {
	if (!sequence) {
		throw new Error('sequence can not be null');
	}

	return deferred(this, {
		properties: {
			sequence: new LINQ(sequence)
		},

		call: concat
	});
};

LINQ.prototype.contains = function (value) {
	var array = this.toArray();

	for (var i = 0, length = array.length; i < length; ++i) {
		if (array[i] === value) {
			return true;
		}
	}

	return false;
};

LINQ.prototype.count = function (predicate) {
	return (predicate ? this.where(predicate) : this).toArray().length;
};

LINQ.prototype.distinct = function () {
	return deferred(this, {
		properties: {},

		call: distinct
	});
};

LINQ.prototype.elementAt = function (index) {
	var element = this.elementAtOrDefault(index);

	if (typeof element === 'undefined') {
		throw new Error('No element at that index.');
	}

	return element;
};

LINQ.prototype.elementAtOrDefault = function (index) {
	return this.toArray()[index];
};

LINQ.prototype.except = function (sequence) {
	if (!sequence) {
		throw new Error('sequence can not be null');
	}

	return deferred(this, {
		properties: {
			sequence: new LINQ(sequence)
		},

		call: except
	});
};

LINQ.prototype.first = function (predicate) {
	var first = this.firstOrDefault(predicate);

	if (typeof first === 'undefined') {
		throw new Error('The source sequence is empty.');
	}

	return first;
};

LINQ.prototype.firstOrDefault = function (predicate) {
	return (predicate ? this.where(predicate) : this).toArray()[0];
};

LINQ.prototype.groupBy = function (keySelector, elementSelector, resultSelector) {
	return deferred(this, {
		properties: {
			keySelector: toFunction(keySelector),
			elementSelector: toFunction(elementSelector, defaultSelector),
			resultSelector: resultSelector // check
		},

		call: groupBy
	});
};

LINQ.prototype.groupJoin = function (inner, outerKeySelector, innerKeySelector, resultSelector) {
	if (!inner) {
		throw new Error('inner can not be null');
	}

	return deferred(this, {
		properties: {
			inner: new LINQ(inner),
			outerKeySelector: toFunction(outerKeySelector),
			innerKeySelector: toFunction(innerKeySelector),
			resultSelector: toFunction(resultSelector)
		},

		call: groupJoin
	});
};

LINQ.prototype.intersect = function(sequence) {
	if (!sequence) {
		throw new Error('sequence can not be null');
	}

	return deferred(this, {
		properties: {
			sequence: new LINQ(sequence)
		},

		call: intersect
	});
};

LINQ.prototype.join = function (inner, outerKeySelector, innerKeySelector, resultSelector) {
	if (!inner) {
		throw new Error('inner can not be null');
	}

	return deferred(this, {
		properties: {
			inner: new LINQ(inner),
			outerKeySelector: toFunction(outerKeySelector),
			innerKeySelector: toFunction(innerKeySelector),
			resultSelector: toFunction(resultSelector)
		},

		call: join
	});
};

LINQ.prototype.last = function (predicate) {
	var last = this.lastOrDefault(predicate);

	if (typeof last === 'undefined') {
		throw new Error('The source sequence is empty.');
	}

	return last;
};

LINQ.prototype.lastOrDefault = function (predicate) {
	var array = (predicate ? this.where(predicate) : this).toArray();

	return array[array.length - 1];
};

LINQ.prototype.max = function (selector) {
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
};

LINQ.prototype.min = function (selector) {
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
};

LINQ.prototype.orderBy = function (keySelector, comparer) {
	var operations = this._operations.slice();

	operations.push({
		properties: {
			keySelector: toFunction(keySelector),
			comparer: toFunction(comparer, defaultComparer)
		},

		call: orderBy
	});

	return new OrderedLINQ(this._source, operations);
};

LINQ.prototype.orderByDescending = function (keySelector, comparer) {
	return this.orderBy(keySelector, comparer).reverse();
};

LINQ.prototype.reverse = function () {
	return deferred(this, {
		properties: {},

		call: reverse
	});
};

LINQ.prototype.select = function (predicate) {
	return deferred(this, {
		properties: {
			predicate: toFunction(predicate)
		},

		call: select
	});
};

LINQ.prototype.selectMany = function (collectionSelector, resultSelector) {
	return deferred(this, {
		properties: {
			collectionSelector: toFunction(collectionSelector),
			resultSelector: toFunction(resultSelector, defaultSelector2)
		},

		call: selectMany
	});
};

LINQ.prototype.sequenceEqual = function (sequence) {
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
};

LINQ.prototype.skip = function (count) {
	return deferred(this, {
		properties: {
			count: count
		},

		call: skip
	});
};

LINQ.prototype.skipWhile = function (predicate) {
	return deferred(this, {
		properties: {
			predicate: predicate
		},

		call: skipWhile
	});
};

LINQ.prototype.sum = function (selector) {
	var array = selector
		? this.select(toFunction(selector)).toArray()
		: this.toArray();

	var sum = 0;

	for (var i = array.length; i--;) {
		sum += array[i];
	}

	return sum;
};

LINQ.prototype.take = function (count) {
	return deferred(this, {
		properties: {
			count: count
		},
		
		call: take
	});
};

LINQ.prototype.takeWhile = function (predicate) {
	return deferred(this, {
		properties: {
			predicate: toFunction(predicate)
		},

		call: takeWhile
	});
};

LINQ.prototype.toArray = function () {
	var array = this._source;

	for (var i = 0, length = this._operations.length; i < length; ++i) {
		array = this._operations[i].call(array, this._operations[i].properties);
	}

	return array;
};

LINQ.prototype.toDictionary = function (keySelector, elementSelector) {
	keySelector = toFunction(keySelector);
	elementSelector = toFunction(elementSelector, defaultSelector);

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
};

LINQ.prototype.toList = function () {
	return new LINQ(this.toArray());
};

LINQ.prototype.toLookup = function (keySelector, elementSelector) {
	return toLookup(this.toArray(), toFunction(keySelector), toFunction(elementSelector, defaultSelector));
};

LINQ.prototype.union = function (sequence) {
	return this.concat(sequence).distinct();
};

LINQ.prototype.where = function (predicate) {
	return deferred(this, {
		properties: {
			predicate: toFunction(predicate)
		},

		call: where
	});
};

LINQ.prototype.zip = function (sequence, resultSelector) {
	if (!sequence) {
		throw new Error('sequence can not be null');
	}

	return deferred(this, {
		properties: {
			sequence: new LINQ(sequence),
			resultSelector: toFunction(resultSelector)
		},

		call: zip
	});
};

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

	if (!is('Function', properties.resultSelector)) {
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
	elementSelector = toFunction(elementSelector, defaultSelector);
	
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
