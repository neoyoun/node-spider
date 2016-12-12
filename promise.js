let arr = [[1,2,3],[4,5,6],[7,8,9]]

function dispatch(arr) {
	let result = Promise.resolve([])
	arr.forEach(item=>{
		result = result.then(prevVal =>{
			let promises = []
			item.forEach(data=>{
				promises.push(Promise.resolve(data))
			})

			return Promise.all(promises).then(r=>{
				prevVal.push(r)
				return prevVal
			})
		})
	})
	return result
}
dispatch(arr).then(data=>console.log(data)) //[[1,2,3],[4,5,6],[7,8,9]]