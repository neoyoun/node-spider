const http = require('http')
const request = require('request')
const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')
const colors = require('colors')


const TARGETURL = 'http://yuchai.weilian.cn/shop/index.php';
const cataInfoPath = path.join(__dirname,'codes/cataInfo.json')
const subcataInfoPath = path.join(__dirname,'codes/subcataInfo.json')
const goodsInfoPath = path.join(__dirname,'codes/goodsInfo.json')
const codeInfoPath = path.join(__dirname,'codes/codeInfo.json')
const imagePath = path.join(__dirname,'images')

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
				console.log('写完了。',path.blue)
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
				let subMenus = []
				let subMenuColection = $(topLevel).find('.sub-class h3 a')
					subMenuColection.each((idx, subMenu)=>{
						let subUrl = $(subMenu).attr('href')
						let subName = $(subMenu).text().trim()
						let subId = subUrl.slice(subUrl.lastIndexOf('=')+1)
						subMenus.push({id:subId,url:subUrl,name:subName})

						console.log(`获取二级目录：${subName}，目录ID：${subId}，获取时间 ${getNow()}`)
					})
				parentMenu.subMenu = subMenus
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
	 * 
	 *
	 */
	 return new Promise((resolve,reject)=>{
	 	readFilePromise(filePath)
		.then(parentColection => {
			try{
			parentColection = JSON.parse(parentColection)
			}catch(err){
				throw new Error('parentColection can not be parse')
			}
			let allGoods = []
			parentColection.forEach(parentCata => {
				let parentId = parentCate.id
				let subCates = parentCate.subMenu
				subCates.forEach(subCate=>{
					let url = subCate.url
					let subId = subCate.id
					getDetailGoods(url)
					.then(subCateGoods =>{
						subCateGoods = subCateGoods.map(good=>{
							good.subId = subId
							good.parentId = parentId
						})
						allGoods = allGoods.concat(subCateGoods)
					})
				})
			})
		})
	 })
	
}
function goodsDetail(url,subId,parentId) {
	return new Promise((resolve,reject)=>{
		getDetailGoods(url)
			.then(subCateGoods =>{
				subCateGoods = subCateGoods.map(good=>{
					good.subId = subId
					good.parentId = parentId
				})
				resolve(subCateGoods)
			})
		.catch(err=>{reject(err)})
	})
}
function getDetailGoods(url) {
	return new Promise((resolve,reject)=>{
		fetchUrlByGET(url)
		.then( body=> {
			let goodsDetailColection = []
			let $ = cheerio.load(body);
			let goodList = $('ul.list_pic>li.item').find('.goods-info')
			goodList.each((idx, item)=>{
				let imgs = []
				let imgswrapper = $(item).find('.goods-pic-scroll-show img')
				for (let i = 0; i < imgswrapper.length; i++) {
					imgs.push(imgswrapper[i].src)
				}
				let title = $(item).find('.goods-name a').text()
				console.log(`获取商品：${title}，获取时间：${getNow()}`)
				title = title.split(' ')
				let obj = {
					name:title[2],
					code:title[1],
					brand:title[0],
					imgs,
				}
				goodsDetailColection.push(obj)
			})
			if(goodList.length== 24){
				let nextPage = $('.sort-bar>.pagination ul>li').eq(1)
				let ishasNextPage = $(nextPage).find('a').length > 0
				if(ishasNextPage){
					let url = $(nextPage).find('a').attr('href')
					goodsDetailColection.concat(getDetailGoods(url))
				}
			}
			return Promise.resolve(goodsDetailColection)
		})
		.then(datas => resolve(datas))
		.catch(err => {
			reject(err)
		})
	})
}
//getSubCataInfo()

let test = 'http://yuchai.weilian.cn/shop/index.php?act=search&op=index&cate_id=169'
getDetailGoods(test)
	.then(content=>{
		writeFilePromise('test.json',content)
	})
	.catch(err=>{
		console.log(err)
	})
//goodsFromSubcate(subcataInfoPath)