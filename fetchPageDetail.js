const method = require('./method')
const cheerio = require('cheerio')
let goodUrl = 'http://yuchai.weilian.cn/shop/index.php?act=goods&op=index&goods_id=109821';
//console.log(fetchUrlByGET.toString())
function fetchGoodDetailPage(goodUrl) {
 	method.fetchUrlByGET(goodUrl)
 		.then(body=>{
 			let $ = cheerio.load(body)
 			let breadcrumb = $('.nch-breadcrumb.wrapper')
 			let parentCate = breadcrumb.find('span').eq(2).text().trim()
 			let subCate = breadcrumb.find('span').eq(4).text().trim()
 			let title = breadcrumb.find('span').eq(6).text().trim()
 			let price = $('.ncs-goods-summary .price').text().trim().slice(1)
 			let imgList = $('.zoom-desc.controller').find('img')
 			let imgs = []
 			for(let i=0;i<imgList.length;i++){
 				imgs.push($(imgList[i]).attr('src').replace('_60.','.'))
 			}
 			title = title.split(' ')
 			let goodCode=title[1];
 			if(title.length >3 && title[1].length == 0){
 				let i=0;
 				while(title[i].trim().length == 0){
 					i++
 				}
 				goodCode = title[i]
 			}
 			let goodInfo = {
 				goodCode,
 				name:title[title.length-1],
 				price,
 				brand:title[0],
 				imgs
 			}
 			goodInfo = Object.assign({},goodInfo,{subCate,parentCate})
 			return Promise.resolve(goodInfo)
 		})
 		.then(good=>{
 			console.log(JSON.stringify(good))
 		})
 		.catch(err=>{
 			throw err
 		})
 }
 fetchGoodDetailPage(goodUrl)