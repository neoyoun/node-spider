function* g() {
	console.log('1st>> ',(yield promiseA()))
	console.log('2nd>> ',(yield promiseB()))
	console.log('3rd>> ',(yield promiseC()))
	let result3 = yield promiseD()
	console.log('4th>> ',result3)
	let result4 = yield promiseE()
	console.log('5th>> ',yield)

	/*let result = yield promiseA();
	console.log(result)
	yield promiseB();
	yield promiseC();
	yield promiseD();
	yield promiseE();*/

}
function promiseA() {
	return Promise.resolve('a')
}
function promiseB() {
	return Promise.resolve('b')
}
function promiseC() {
	return Promise.resolve('c')
}
function promiseD() {
	return Promise.resolve('d')
}
function promiseE() {
	return Promise.resolve('E')
}

function* fibonacci() {
	let [prev, curr] = [0, 1]
	for(;;){
		[prev, curr] = [curr, curr + prev]
		yield curr
	}
}

for(let n of fibonacci()){
	if(n > 10000) break;
	console.log(n)
}