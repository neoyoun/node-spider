const method = require('./method')
const path = require('path')
const colors = require('colors')
const detailsPath = path.join(__dirname,'codes/goodsInfo.json')

let arr=[57,58,59,60,61,62,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,167,166,16,92,93,94,95,96,97,98,99,100,101
,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,
125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,165,156,157,158,160,161,162,164,14,13,12,11]
arr.sort(function (a,b) {
	return a<b
})

method.readFilePromise(detailsPath)
	.then(data=>{
		let count = 0;
		data = JSON.parse(data)
		let cateCollection = []
		data.forEach(item=>{
			cateCollection.push(+item.id)
			let goods = item.goods
			if(goods.length >=24){
				console.log(`超过2页的数据 id>> ${item.id}, name>> ${item.name}`)
			}
			count += goods.length
			//console.log((`${item.name} 下有 ${goods.length} 条信息,ID为${item.id}`).green)
		})
		console.log(`总共有${count}条数据`.red)
		/*cateCollection.sort((a,b)=> a<b)
		console.log(cateCollection.toString())*/
	})