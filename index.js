const http = require('http')
const request = require('request')
const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
const colors = require('colors')


const TARGETURL = 'http://yuchai.weilian.cn/shop/index.php';
const cataInfoPath = path.join(__dirname,'codes/cataInfo.json')
const subCateInfoPath = path.join(__dirname,'codes/subcataInfo.json')
const goodsInfoPath = path.join(__dirname,'codes/goodsInfo.json')
const codeInfoPath = path.join(__dirname,'codes/codeInfo.json')
const imagePath = path.join(__dirname,'images')
const testsubCateInfoPath = path.join(__dirname,'./codes/testsubcataInfo.json')
const testJson = path.join(__dirname,'./testData.json')

function getNow(format) {
	let d = new Date()
	let H = d.getHours()
	let m = d.getMinutes()
	let s = d.getSeconds()
	return `${H}:${m}:${s}`;
}
function fetchUrlByGET(url) {
	return new Promise((resolve,reject)=>{
		request({url:url,method:'GET'},function (err,res,body) {
			if(!err){
				resolve(body)
			}else{
				reject(err)
			}
		})
	})
}

function writeFilePromise(path,json) {
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
				console.log('写完了。',path.warning)
				resolve()
			}
		});
	})
}
function readFilePromise(path) {
	return new Promise((resolve,reject)=>{
		fs.readFile(path, 'utf8', (err,data)=>{
			if(!err){resolve(data)}
				else {reject(err)}
		});
	})
}

function getSubCataInfo() {
	readFilePromise(cataInfoPath)
		.then(data=>{
			try{
				data = JSON.parse(data)
			}catch(err){
				throw new Error('data can not be parse')
			}
			let url = data.cataInfo[0].url;
			return fetchUrlByGET(url)
		})
		.then(body=>{
			let $ = cheerio.load(body);
			let topLevelList = $('.right ul.menu li');
			let menuList = [];
			topLevelList.each((idx, topLevel)=>{
				let parentId = $(topLevel).attr('cat_id')
				let url = $(topLevel).find('h4 a').attr('href')
				let name = $(topLevel).find('h4 a').text().trim()
				let parentMenu = {id:parentId,url,name}
				console.log(`获取主目录：${name}，目录ID：${parentId}，获取时间 ${getNow()}`)
				let subCates = []
				let subMenuColection = $(topLevel).find('.sub-class h3 a')
					subMenuColection.each((idx, subMenu)=>{
						let subUrl = $(subMenu).attr('href')
						let subName = $(subMenu).text().trim()
						let subId = subUrl.slice(subUrl.lastIndexOf('=')+1)
						subCates.push({id:subId,url:subUrl,name:subName})

						console.log(`获取二级目录：${subName}，目录ID：${subId}，获取时间 ${getNow()}`)
					})
				parentMenu.subCates = subCates
				menuList.push(parentMenu)
			})
			return writeFilePromise(subcataInfoPath, menuList)
		})
		.catch(err => {throw err})
}

function goodsFromSubcate(filePath) {
	//根据二级目录遍历出所有商品
	/* 最终结果格式
	 * {
	 	code:goodCode, *商品代码
	 	name:goodName, *商品名
	 	brand:goodBrand, *商品品牌
	 	imgs:[], *图片列表
	 	subId:subId, *二级目录 ID
	 	parentId:parentId  *主目录 ID
	  }
	 */
	 
	
	 	readFilePromise(filePath)
		.then(parentColection => {
			try{
			parentColection = JSON.parse(parentColection)
			}catch(err){
				return Promise.reject('parentColection can not be parse')
			}
			return Promise.all(parentColection.map(parentCate=>{
				/*
				 * 返回 [[{obj1}],[{obj2}],[{obj3}]]
				 * 需要后续再格式化
				 */
				let parentId = parentCate.id
				let parentName = parentCate.name
				let subCates = parentCate.subCates
				console.log((`正在遍历主目录 ${parentName}(${parentId})`).green)
				return Promise.all(subCates.map(subCate=>{
					return Promise.resolve(fetchSubcatePages(subCate))
					.then(subcateGoods=>{
						subcateGoods.parentId = parentId;
						subcateGoods.parentName = parentName;
						return subcateGoods
					})
				})).then(subcateGoods=>{
					return subcateGoods
				})
			}))
		})
		.then(allGoods=>{
			allGoods = allGoods.reduce((prevArr,nextArr)=>{
				return prevArr.concat(nextArr)
			})
			let cateLen = allGoods.length;
			let goodsLen = 0
			let goodHasImg = 0
			let imgLen = 0
			allGoods.forEach(subcateGood=>{
				let goods = subcateGood.goods;
				goodsLen += goods.length;

				goods.forEach(good=>{
					if(good.imgs.length>0){
						goodHasImg++;
						imgLen += good.imgs.length
					}
				})
			})
			console.log('代码抓取完成')
			console.log(`共有商品 ${goodsLen} 条----商品分类${cateLen} 个`)
			console.log((`其中有图片代码 ${goodHasImg} 个，图片共${imgLen}张`).green)
			return writeFilePromise(goodsInfoPath,allGoods)
		})
		.catch(err=>{
			throw err
		})
}
goodsFromSubcate(subCateInfoPath)

function fetchSubcatePages(subCate) {
	let id = subCate.id;
	let cateName = subCate.name;
	let url = subCate.url
	return subcateGoods = fetchPagesArr(url)
		.then(goodsArr=>{
			let subcateGoods = {
				id:id,
				name:cateName,
				goods:goodsArr,
			}
			//console.log(subcateGoods)
			return subcateGoods
		})
}

function fetchPagesArr(firstPageUrl) {
	/*
	 * 返回一组页码（一个分类下的所有分页）抓取的最后结果的promise实例
	 * 返回promise实例是为了后面对该结果进行下一步的操作
	 */
	return goodsCollection = getAllPage(firstPageUrl)
		.then(pageCollection=>{
			return fetchAllPages(pageCollection)
		})
		.then(goodsCollection=>{
			return Promise.resolve(goodsCollection)
		})
}


function getAllPage(firstPage) {
	/*
	 * @param 分页中的第一页
	 * @return 页面 url 数据集合的promise实例
	 */
	 let pageCollection = []
	 let pageIdx = 1
	 return new Promise((resolve,reject) => {
	 	!function getCurrPage(url) {
	 		pageCollection.push(url)
	 		//console.log(`获得第${pageIdx}页地址:${url.slice(url.length-25)}`.green)
	 		pageIdx++;
	 		
	 		fetchUrlByGET(url)
	 		.then(body=>{
	 			let $ = cheerio.load(body)
	 			let goodList = $('ul.list_pic>li.item').find('.goods-info');
	 			let nextPage = $('.sort-bar>.pagination ul>li').eq(1).find('a')
				let ishasNextPage = $(nextPage).length > 0
	 			if(goodList.length== 24 && (nextPage.length > 0)){
					let nextPageUrl = $(nextPage).attr('href')
					return Promise.reject(nextPageUrl)
				}else{
					return Promise.resolve(pageCollection)
				}
	 		})
	 		.then(pages=>{
	 			resolve(pages) 
	 		})
	 		.catch(nextPageUrl=>{
	 			getCurrPage(nextPageUrl)
	 		})
	 	}(firstPage)
	 })
}

function fetchAllPages(pageArr) {
	/* 根据传入的页码数组同时抓取数据 返回最终结果 
	 * 单个页面返回的是一个产品数组
	 * 所有页面返回的是一个二维数组，其中每一项就是单页的数组
	 * 使用 reduce 犯法合并为一维数组，返回
	 */
	return new Promise(resolve=>{
		Promise.all(pageArr.map(url=>{
			return fetchGoodsByPage(url)
		})).then(goodsCollection=>{
			let finalArray = goodsCollection.reduce((prevPage,nextPage)=>{
				return prevPage.concat(nextPage)
			})
			return Promise.resolve(finalArray)
			
		}).then(finalArray=>{
			resolve(finalArray)
		})
	})
}

function fetchGoodsByPage(url) {
	/*
	 * 根据传入产品页面抓取数据
	 * 返回页面产品的数组集合
	 *
	 */
	return new Promise((resolve, reject)=>{
		let goodsCollection = []
		fetchUrlByGET(url)
			.then(body=>{
	 			let $ = cheerio.load(body)
	 			let goodList = $('ul.list_pic>li.item').find('.goods-info');
				goodList.each((idx, item)=>{
					let imgs = []
					let imgswrapper = $(item).find('.goods-pic-scroll-show img')
					for (let i = 0; i < imgswrapper.length; i++) {
						imgs.push($(imgswrapper[i]).attr('src').replace('_60',''))
					}
					let title = $(item).find('.goods-name a').text()
					console.log(`获取商品：${title}，获取时间：${getNow()}`)
					title = title.split(' ');
					let goodCode;
					if(title.length == 3){
						goodCode = title[1].trim()
					}else if(title.length>3){
						let i=1;
						while(title[i].trim().length == 0){
							i++;
						}
						goodCode = title[i]
					}
					let obj = {
						code:goodCode,
						name:title[title.length-1],
						brand:title[0],
						imgs,
					}
					goodsCollection.push(obj)
				})
	 			return Promise.resolve(goodsCollection)
	 		})
	 		.then(goodsCollection=>{
	 			resolve(goodsCollection)
	 		})
	})
}