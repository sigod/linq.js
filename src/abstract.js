
function AbstractLINQ() {}

AbstractLINQ.prototype._isLINQ = true;

AbstractLINQ.prototype._deferred = function (operation) {
	var ops = this._operations.slice();
	ops.push(operation);

	return new this.constructor(this._source, ops);
};