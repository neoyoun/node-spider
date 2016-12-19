const request = require('request')
const fs = require('fs')
const path = require('path')

const testObj = {
        "filename": "A3500-9000200_00.jpg",
        "src": "http://static.yuchai.weilian.cn:29029/upload/shop/store/goods/1/1_04888377245783265.jpg"
    }

const testPath = path.join(__dirname,'./testStream/')

function downTest(src, filename, dir) {

	if(!fs.existsSync(dir)){
		fs.mkdirSync(dir, 777)
		console.log(dir+' 目录已创建')
	}
	let savePath = dir + filename;
	request.head(src, (err, res, body)=>{
		if(err){
			console.log(('request occur error'+src).red)
			reject(err)
		} else {
			console.log('开始下载图片 '+filename)
			request(src).pipe(fs.createWriteStream(path.resolve(savePath)),{autoClose:true}).on('close',()=>{
				resolve(filename)
			})
		}
		
	})
}
downTest(testObj.src, testObj.filename,testPath )