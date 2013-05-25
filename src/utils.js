
/*
 *	Utils
 */

function defaultSelector(e) {
	return e;
}

function defaultSelector2(e1, e2) {
	return e2;
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

function toFunction(expr, defaultFunction) {
	if (is('Function', expr)) return expr;
	if (is('String', expr)) {
		var index = expr.indexOf('=>');

		if (index !== -1)
			return new Function(expr.substr(0, index), 'return ' + expr.substr(index + 2));

		return new Function('$1,$2,$3,$4', 'var $=$1;return ' + expr);
	}

	if (defaultFunction) return defaultFunction;

	throw new Error('parameter must be a function or lambda');
}

function is(type, object) {
	var clas = Object.prototype.toString.call(object).slice(8, -1);
	return object !== undefined && object !== null && clas === type;
}
