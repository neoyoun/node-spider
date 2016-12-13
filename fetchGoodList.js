const {fetchUrlByGET,getNow} = require('./method')
const cheerio = require('cheerio')
const cateUrl = 'http://yuchai.weilian.cn/shop/index.php?act=search&op=index&cate_id=12';

//let arr = [fetchGoodList(cateUrl1),fetchGoodList(cateUrl2),fetchGoodList(cateUrl3)]
function fetchGoodList(cateUrl) {
	return new Promise((resolve, reject)=>{
		fetchUrlByGET(cateUrl)
		.then(body=>{
			let $ = cheerio.load(body)
			let goodList = $('ul.list_pic>li.item').find('.goods-info');
			let goodsDetailColection=[]
			goodList.each((idx, item)=>{
				let imgs = []
				let imgswrapper = $(item).find('.goods-pic-scroll-show img')
				for (let i = 0; i < imgswrapper.length; i++) {
					imgs.push($(imgswrapper[i]).attr('src'))
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
				goodsDetailColection.push(obj)
			})
			if(goodList.length== 24){
				let nextPage = $('.sort-bar>.pagination ul>li').eq(1)
				let ishasNextPage = $(nextPage).find('a').length > 0
				if(ishasNextPage){
					let nextPageUrl = $(nextPage).find('a').attr('href')
					return Promise.resolve(fetchGoodList(nextPageUrl))
				}
			}
			return Promise.resolve(goodsDetailColection)
		})
		.then(goods=>{
			resolve(goods)
		})
		.catch(err=>{
			reject(err)
		})
	})
}
/*Promise.all(urlList.push(fetchGoodList(cateUrl)))
	.then(urlList =>{
		console.dir(urlList)
	})
	.catch(err=>{
		throw err
	})*/
