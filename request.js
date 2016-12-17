const request = require('request')
const http = require('http')
let url = 'http://116.10.197.141/shop/index.php'


http.request(url)
	.on('response',res=>{
		console.log(res.headers['content-length'])
	})