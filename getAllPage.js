const {fetchUrlByGET,getNow,writeFilePromise} = require('./method')
const cheerio = require('cheerio')
const request = require('request')
const colors = require('colors')
const path = require('path')
const cateUrl = 'http://yuchai.weilian.cn/shop/index.php?act=search&op=index&cate_id=1';
const targetPath = path.join(__dirname,'./twopage.json')
//let arr = [fetchGoodList(cateUrl1),fetchGoodList(cateUrl2),fetchGoodList(cateUrl3)]
let pageArr = ['http://yuchai.weilian.cn/shop/index.php?act=search&op=index&cate_id=2','http://yuchai.weilian.cn/shop/index.php?act=search&op=index&cate_id=2&curpage=2']

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
	 		console.log(`获得第${pageIdx}页地址`.green)
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
getAllPage(cateUrl)
	.then(pages=>{
		console.log(`正在抓取内容，一共有${pages.length}页`)
		return Promise.resolve(fetAllPage(pages))
	})
	.then(result=>{
		console.log('全部写完啦')
	})
	.catch(err=>{
		throw err
	})

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

function fetAllPage(pageArr) {
	/* 根据传入的页码数组同时抓取数据
	 * 单个页面返回的是一个产品数组
	 * 所有页面返回的是一个二维数组，其中每一项就是单页的数组
	 * 使用 reduce 方法将数组展开为一维数组，返回
	 */

	Promise.all(pageArr.map(url=>{
		return fetchGoodsByPage(url)
	})).then(goodsCollection=>{
		let finalArray = goodsCollection.reduce((prevPage,nextPage)=>{
			return prevPage.concat(nextPage)
		})
		writeFilePromise(targetPath,JSON.stringify(finalArray,null,4))
	})	
}



