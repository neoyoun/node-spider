const http = require('http')
const request = require('request')
const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')


const TARGETURL = 'http://yuchai.weilian.cn/shop/index.php';
const cataInfoPath = path.join(__dirname,'codes/cataInfo.json')
const subcataInfoPath = path.join(__dirname,'codes/subcataInfo.json')
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
		jsonStr = JSON.stringify(json)
	} else if(typeof json == 'string'){
		jsonStr = json
	}
	return new Promise((resolve, reject)=>{
		fs.writeFile(path, jsonStr, (err)=>{
			if(err){
				reject(err)
			}else{
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
getSubCataInfo()