function promiseA() {
	return new Promise((resolve,reject)=>{
		let randomNum = Math.round(Math.random() * 10)
		if(randomNum < 9){
			resolve(randomNum+'a')
		}else{
			reject(randomNum+'a')
		}
	})
}
function promiseB() {
	return new Promise((resolve,reject)=>{
		let randomNum = Math.round(Math.random() * 10)
		if(randomNum < 9){
			resolve(randomNum+'b')
		}else{
			reject(randomNum+'b')
		}
	})
}
function promiseC() {
	return new Promise((resolve,reject)=>{
		let randomNum = Math.round(Math.random() * 10)
		if(randomNum < 9){
			resolve(randomNum+'c')
		}else{
			reject(randomNum+'c')
		}
	})
}
function promise() {
	return new Promise((resolve, reject)=>{
		let arr = []
		promiseA()
		.then(result=>{
			let newArr = [];
			newArr[0]=result;
			arr = arr.concat(newArr)
			console.log(arr)
			return promiseB()
		})
		.then(result=>{
			
			let newArr = [];
			newArr[0]=result;
			arr = arr.concat(newArr)
			console.log(arr)
			return promiseC()
		})
		.then(result=>{
			let newArr = [];
			newArr[0]=result;
			arr = arr.concat(newArr)
			console.log(arr)
			resolve(arr)
		})
		.catch(err=>console.error(err))
	})
}

promise()
	.then(result=>{
		console.log('finish')
		console.log(result)
	})
