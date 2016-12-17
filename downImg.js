const method = require('./method')
const path = require('path')
const fs = require('fs')
const request = require('request')
const colors = require('colors')


const dataPath = path.join(__dirname, 'codes/goodsInfo.json')
const ImgRootPath = path.join(__dirname,'./images/')
method.readFilePromise(dataPath)
	.then(data=>{
		/*
		 * 创建目录
		 * @return []
		 *
		 */
		data = JSON.parse(data)
		let categoods = data.map(subCate=>{
			let goods = subCate.goods
			let cateName = subCate.name
			let parentCate = subCate.parentName
			let parentPath = ImgRootPath + parentCate+'/'
			let catePath = parentPath+cateName+'/'
			
			if(!fs.existsSync(catePath)){
				if(!fs.existsSync(parentPath)){
					fs.mkdirSync(parentPath, 777)
					console.log(`主目录 ${parentCate} 已创建`)
				}
				fs.mkdirSync(catePath, 777);
				console.log(`二级目录 ${cateName}（${parentCate}） 已创建`)
			}
			return {
				catePath,
				goods
			}
		})
		return Promise.all(categoods)
	})
	.then(categoods=>{
		return Promise.all(categoods.map(categood=>{
			/*
			 * return {catepath:catepage,imgs[{imgs1},{imgs2},{imgs3}]}
			 *
			 */
			let goods = categood.goods
			let imgsCollection = []
			goods.forEach(good=>{
				let imgs = good.imgs
				let code = good.code
				let imgsCount = imgs.length;
				if(imgsCount !== 0){
					for(let i=0;i<imgsCount;i++){
						let postFix = imgs[i].slice(imgs[i].lastIndexOf('.'))
						imgsCollection.push({
							filename:code+'_0'+i+postFix,
							src:imgs[i]
						})
					}
				}
			})
			return {catePath:categood.catePath,imgs:imgsCollection}
		}))
	})
	.then(catesWithImg=>{
		let filterNoImgCate = catesWithImg.filter(cateWithImg=>{
			return cateWithImg.imgs.length != 0
		})
		let imgsCollection = []
		filterNoImgCate.forEach(imgCate=>{
			let dir = imgCate.catePath
			let imgs = imgCate.imgs
			imgs.forEach(img=>{
				let filename = img.filename
				let src = img.src
				imgsCollection.push({dir,filename,src})
			})
		})
		return Promise.all(imgsCollection)
	})
	.then(imgsCollection=>{
		for(let i=0;i<5;i++){
			downLoadImg(imgsCollection[i].src,imgsCollection[i].dir,imgsCollection[i].filename)
		}
	})
	.catch(err=>{
		console.error('catch error from read file'.red)
		throw err
	})


function downLoadImg(src, dir, filename) {
	return new Promise((resolve,reject)=>{
		let savePath = dir+filename.replace('*','')
		request.head(src, (err, res, body)=>{
			if(err){
				reject(err)
			} else {
				console.log('开始下载图片'+filename)
				request(src).pipe(fs.createWriteStream(path.resolve(savePath))).on('close',()=>{
					console.log((filename+' 下载完成').green)
					resolve()
				})
			}
			
		})
	})
	
}
