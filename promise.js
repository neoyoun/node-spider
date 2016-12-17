let arr = [[promiseA,promiseB,promiseC],[promiseD,promiseE,promiseF],[promiseG,promiseH,promiseI]]

function promiseA() {
	return Promise.resolve('a')
}
function promiseB() {
	return Promise.resolve('b')
}
function promiseC() {
	return Promise.resolve('C')
}
function promiseD() {
	return Promise.resolve('D')
}
function promiseE() {
	return Promise.resolve('E')
}
function promiseF() {
	return Promise.resolve('F')
}
function promiseG() {
	return Promise.resolve('G')
}
function promiseH() {
	return Promise.resolve('H')
}
function promiseI() {
	return Promise.resolve('I')
}
function dispatch(arr) {
	let result = Promise.resolve(arr.map(group=>{
		return Promise.all(group)
	}))
	return Promise.resolve(result.then(allgroup=>{
		let allResult = allgroup.map(promisegroup=>{
			return promisegroup.then(subitemarr=>{
				return subexcuteresult = subitemarr.map(subitem=>{
					return subitem().then(data=>data)
				})
			})
			.then(result=>{
				return Promise.all(result)
			})
			.then(result=>{
				let resultarr= []
				return Promise.resolve(result.map(data=>data))
			})
			.then(result=>{
				return result
			})
		})
		return Promise.all(allResult)
	}))
}
dispatch(arr).then(result=>{
	console.log(result)
})
let newarr = [promiseA,promiseB,promiseC]
/*Promise.all(newarr)
	.then(result=>{
		return Promise.all(result.map(subitem=>{
			return result = subitem().then(data=>data)
		}))
	})
	.then(result=>{
		console.log(result)
	})
*/