const method = require('./method')
const path = require('path')
const fs = require('fs')
const request = require('request')
const colors = require('colors')


const dataSource = path.join(__dirname, 'codes/goodsInfo.json')
const imgSourcePath = path.join(__dirname, 'codes/imgsInfo.json')
const ImgRootPath = path.join(__dirname,'./images/')

function saveImgsInfo() {
	return method.readFilePromise(dataSource)
	.then(data=>{
		data = JSON.parse(data)
		let imgsCollection = []
		data.forEach(subcate=>{
			let goods = subcate.goods
			goods.forEach(good=>{
				let imgs = good.imgs
				if(imgs.length > 0){
					let code = good.code
					for(let i=0;i<imgs.length;i++){
						let postFix = imgs[i].slice(imgs[i].lastIndexOf('.'))
						let filename = code+'_0'+i+postFix
						imgsCollection.push(Promise.resolve({
							filename,
							src:imgs[i]
						}))
					}
				}
			})
		})
		return Promise.all(imgsCollection)
	})
	.then(imgsCollection=>{
		//if(fs.existsSync(imgSourcePath)) return;
		return method.writeFilePromise(imgSourcePath, imgsCollection)
	})
}
saveImgsInfo()
	.then(data=>{
		console.log(data.slice(0,10))
	})
function readFileTodown(filePath) {
	method.readFilePromise(filePath)
		.then(imgsCollection=>{
			imgsCollection = JSON.parse(imgsCollection)
			let imgsLen = imgsCollection.length
			console.log(`一共有 ${imgsLen} 张图片`)
			for(let i=2000; i<4000;i++){
				downImgToLocal(imgsCollection[i].src, imgsCollection[i].filename, ImgRootPath)
					.then(name=>{
						console.log(('已下载 ' + name).green)
					})
					.catch(err=>{
						console.error((`${imgsCollection[i].filename} 下载失败`).red)
						console.error(err)
					})
			}
			//return Promise.all(downImgsProcess)
		})
		.catch(err=>{
			console.error(err)
		})
}
function downImgToLocal(src,filename, dir) {
	return new Promise((resolve,reject)=>{
		let savePath = ImgRootPath+filename.replace('*','')
		if(fs.existsSync(savePath)){
			console.log(filename+' is exist')
			return;
		} else {
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
	})
	
}