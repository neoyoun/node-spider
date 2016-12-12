const request = require('request')
const fs = require('fs')
const imgUrl = 'http://static.yuchai.weilian.cn:29029/upload/shop/store/goods/1/1_05195823655050305.jpg';
request(imgUrl).pipe(fs.WriteStream('target.jpg'))