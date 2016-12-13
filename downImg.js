const method = require('./method')
const path = require('path')
const fs = require('fs')
const request = require('request')
const colors = require('colors')


const dataPath = path.join(__dirname, 'codes/goodsInfo.json')


method.readFilePromise(dataPath)
	.then(data=>{
		return Promise.resolve(JSON.parse(data))
	})
	.then(data=>{
		let allImgLen = 0;
		let codeHaveImg = 0;
		data.forEach((item, idx)=>{
			if(idx < 30 && idx >=10){
				let cateDir = path.join(__dirname,`./images/${item.name}`)
				if (!fs.existsSync(cateDir)) {
			         fs.mkdirSync(cateDir);
			         console.log(`${item.name} 目录已创建`);
			     }
			    let goods = item.goods
			    let cate = item.name
			    goods.forEach( good =>{
			    	let imgList = good.imgs;
				    if(imgList.length>0){
				    	let code = good.code;
				    	let name = good.name;
				    	codeHaveImg++
				    	for(let i=0;i<imgList.length;i++){
				    		let imgUrl = imgList[i];
				    		let postFix = imgUrl.slice(imgUrl.lastIndexOf('.'))
				    		let fileName = code+'_0'+i+postFix;
				    		//let imgSaveName = cateDir+'/'+code+'_0'+i+postFix;
				    		startDownLoad(imgUrl, cateDir, fileName)
				    		allImgLen++;
				    	//console.log(`已下载 ${name}(${code}) 的第 ${i+1} 张图片。-->${cate}`)
				    	}
				    }
			    })	
			}
			
		})
		console.log(`一共有${codeHaveImg}条代码有图片,共计 ${allImgLen} 张`)
	})
	.catch(err => {
		throw err
	})

function startDownLoad(url, dir, fileName) {
	console.log(('正在下载...'+fileName))
	let savePath = dir+'/'+fileName;
	if(savePath <5 ){
		throw new Error('文件名出错 ',fileName)
	}
	let writeStream = fs.createWriteStream(savePath)
	request.head(url, function (err, res, body) {
		if(err){
			throw new Error(err)
		}
		request(url).pipe(writeStream)
		console.log((fileName+'下载完成!').green)
	})
}