const fs = require('fs')
const request = require('request')

const method = {
	fetchUrlByGET: function (argument) {
		return new Promise((resolve,reject)=>{
			request({url:url,method:'GET'},function (err,res,body) {
				if(!err){
					resolve(body)
				}else{
					reject(err)
				}
			})
		})
	},
	writeFilePromise: function(path,json) {
		let jsonStr;
		if(typeof json == 'object' || typeof json == 'array'){
			jsonStr = JSON.stringify(json,null,4)
		} else if(typeof json == 'string'){
			jsonStr = json
		}
		return new Promise((resolve, reject)=>{
			fs.writeFile(path, jsonStr, (err)=>{
				if(err){
					reject(err)
				}else{
					console.log('写完了。',path.blue)
					resolve()
				}
			});
		})
	},
	readFilePromise(path) {
		return new Promise((resolve,reject)=>{
			fs.readFile(path, 'utf8', (err,data)=>{
				if(!err){resolve(data)}
					else {reject(err)}
			});
		})
	}

}
module.exports = method