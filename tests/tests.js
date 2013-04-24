
test('aggregate', function () {
	var original = [1, 2, 3, 4, 5, 6];

	var linq = LINQ(original);

	equal(linq.aggregate(100, '$ + $$'), 121, 'wrong result');
	equal(linq.aggregate(100, '$ + $$', '$ - 100'), 21, 'wrong result');
});

test('all', function () {
	var result = LINQ(['hello', 'alkdsjf', '10', '0'])
		.all('typeof $ === "string"')
	;

	equal(result, true, 'wrong result');

	var result = LINQ([1, 2, 3, 4, 5, 6, 0])
		.all('$ > 0')
	;

	equal(result, false, 'wrong result');
});

test('any', function () {
	var result = LINQ([0, 1, 2, 3, 4, 5, 6, 7, 8])
		.any('e => e === 5')
	;

	equal(result, true, 'wrong result');
});

test('average', function () {
	var result = LINQ([78, 92, 100, 37, 81]).average();

	equal(result, 77.6, 'wrong result');

	var array = ['apple', 'banana', 'mango', 'orange', 'passionfruit', 'grape'];
	var result = LINQ(array).average('$.length');

	equal(result, 6.5, 'wrong result');
});

test('elementAtOrDefault', function () {
	var linq = LINQ([0, 1, 2, 3, 4, 5, 6, 7, 8, '']);

	equal(linq.elementAtOrDefault(1), 1, 'wrong element');
	equal(linq.elementAtOrDefault(8), 8, 'wrong element');
	equal(linq.elementAtOrDefault(10), null, 'wrong element');
	equal(linq.elementAtOrDefault(9), '', 'wrong element');
});

test('where', function() {
	var original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
	var test_array = original.slice();

	var linq = LINQ(test_array)
		.where('e => e > 3 && e < 9')
		.where('$ > 4')
		.where(function (e) { return e !== 7; })
	;

	deepEqual(linq.toArray(), [5, 6, 8], 'wrong result');
	deepEqual(test_array, original, 'source array must not be changed');

	test_array.push(5);

	deepEqual(linq.toArray(), [5, 6, 8, 5], 'wrong result: LINQ should reflect to changes in source');
});