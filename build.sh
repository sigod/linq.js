#! /bin/bash

if [ -f tmp.js ]; then
	rm tmp.js
fi

cat LICENSE >> tmp.js
echo ";(function (exports) {"$'\n\t'"\"use strict\";" >> tmp.js
cat src/linq.js >> tmp.js
cat src/enumerable.js >> tmp.js
cat src/ordered.js >> tmp.js
cat src/utils.js >> tmp.js
echo "}(this));" >> tmp.js

cp tmp.js linq.js
rm tmp.js