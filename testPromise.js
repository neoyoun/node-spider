function initial() {
	return new Promise((resolve, reject)=>{
		let num = Math.round(Math.random()*10);
		if(num<10){
			resolve(num)
		}else{
			reject(num)
		}
	})
}

initial()
	.then(num=>{
		let arr = ['a','b','c','d','e','f','g','h']
		let newArr = []
		for(let i=0;i<arr.length;i++){
			newArr.push(arr[i]+(i+num))
		}
		return Promise.resolve(newArr)
	})
	.then(arr=>{
		console.dir(arr)
	})
	.catch(err=> {
		throw err
	})