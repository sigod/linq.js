
test('range', function () {
	deepEqual(LINQ.range(0, 5).toArray(), [0, 1, 2, 3, 4]);
});

test('repeat', function () {
	deepEqual(LINQ.repeat(1, 5).toArray(), [1, 1, 1, 1, 1]);
});

test('aggregate', function () {
	var original = [1, 2, 3, 4, 5, 6];

	var linq = LINQ(original);

	equal(linq.aggregate(100, '$1 + $2'), 121, 'wrong result');
	equal(linq.aggregate(100, '$1 + $2', '$ - 100'), 21, 'wrong result');
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

test('firstOrDefault', function () {
	var linq = LINQ([0, 1, 2, 3, 4, 5, 6]);

	equal(linq.firstOrDefault(), 0, 'wrong result');
	equal(linq.firstOrDefault('$ > 4'), 5, 'wrong result');
	equal(linq.firstOrDefault('$ > 10'), undefined, 'wrong result');
});

test('lastOrDefault', function () {
	var linq = LINQ.range(0, 11);

	equal(linq.lastOrDefault(), 10, 'wrong result');
	equal(linq.lastOrDefault('$ < 5'), 4, 'wrong result');
	equal(linq.lastOrDefault('$ > 10'), undefined, 'wrong result');
});

test('orderByDescending', function () {
	var linq = LINQ([0, 3, 1, 9, 2, 6, 8, 4, 7, 5]);
	var ordered = linq.orderByDescending('$').toArray();

	deepEqual(ordered, [9, 8, 7, 6, 5, 4, 3, 2, 1, 0], 'wrong result');

	var ordered = linq.orderByDescending('$', '($1 === $2) ? 0 : ($1 > $2) ? -1 : 1').toArray();

	deepEqual(ordered, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 'wrong result');
});

test('select', function () {
	var array = LINQ.range(1, 10).select('$ * $').toArray();

	deepEqual(array, [1, 4, 9, 16, 25, 36, 49, 64, 81, 100], 'wrong result');

	var array = LINQ(['apple', 'banana', 'mango', 'orange', 'passionfruit', 'grape'])
		.select('fruit, index => { index: index, str: fruit.substr(0, index) }')
		.toArray()
	;
	var expected = [
		{ index: 0, str: '' },
		{ index: 1, str: 'b' },
		{ index: 2, str: 'ma' },
		{ index: 3, str: 'ora' },
		{ index: 4, str: 'pass' },
		{ index: 5, str: 'grape' }
	];

	deepEqual(array, expected, 'wrong result');
});

test('selectMany', function () {
	var array = [
		{ name: 'Higa, Sidney', pets: ['Scruffy', 'Sam'] },
		{ name: 'Ashkenazi, Ronen', pets: ['Walker', 'Sugar'] },
		{ name: 'Price, Vernette', pets: ['Scratches', 'Diesel'] },
		{ name: 'Hines, Patrick', pets: ['Dusty'] }
	];
	var linq = LINQ(array);

	var result = linq
		.selectMany('owner, index => LINQ(owner.pets).select("pet => " + index + "+ pet")')
		.toArray()
	;
	var expected = ['0Scruffy', '0Sam', '1Walker', '1Sugar', '2Scratches', '2Diesel', '3Dusty'];
	deepEqual(result, expected, 'wrong result');

	var result = linq
		.selectMany('$.pets', 'owner, pet => { owner: owner, pet: pet }')
		.where('$.pet.indexOf("S") === 0')
		.select('{ owner: $.owner.name, pet: $.pet }')
		.toArray()
	;
	var expected = [
		{ owner: 'Higa, Sidney', pet: 'Scruffy' },
		{ owner: 'Higa, Sidney', pet: 'Sam' },
		{ owner: 'Ashkenazi, Ronen', pet: 'Sugar' },
		{ owner: 'Price, Vernette', pet: 'Scratches' }
	];
	deepEqual(result, expected, 'wrong result');
});

test('toDictionary', function () {
	var list = [
		{ company: "Coho Vineyard", weight: 25.2, trackingNumber: 89453312 },
		{ company: "Lucerne Publishing", weight: 18.7, trackingNumber: 89112755 },
		{ company: "Wingtip Toys", weight: 6.0, trackingNumber: 299456122 },
		{ company: "Adventure Works", weight: 33.8, trackingNumber: 4665518773 }
	];

	var result = LINQ(list).toDictionary('$.trackingNumber');

	console.log(result);

	var expected = {
		'89453312': { company: "Coho Vineyard", weight: 25.2, trackingNumber: 89453312 },
		'89112755': { company: "Lucerne Publishing", weight: 18.7, trackingNumber: 89112755 },
		'299456122': { company: "Wingtip Toys", weight: 6.0, trackingNumber: 299456122 },
		'4665518773': { company: "Adventure Works", weight: 33.8, trackingNumber: 4665518773 }
	};

	deepEqual(result, expected);
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