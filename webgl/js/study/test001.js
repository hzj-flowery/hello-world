var startTime = Date.now();

// A time consuming function
foo();
var test1 = Date.now();

// Another time consuming function
bar();
var test2 = Date.now();

// Print results
console.debug("Test1 time: " + (test1 - startTime));
console.debug("Test2 time: " + (test2 - test1));