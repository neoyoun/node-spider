const request = require('request')
const fs = require('fs')
const url = 'http://yuchai.weilian.cn/shop/index.php?act=search&op=index&cate_id=2'

request.get(url).pipe(fs.WriteStream('index.html'))