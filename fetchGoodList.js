const {fetchUrlByGET} = require('./method')
const cheerio = require('cheerio')
const cateUrl = 'http://yuchai.weilian.cn/shop/index.php?act=search&op=index&cate_id=1';

function fetchGoodList(cateUrl) {
	return new Promise((resolve, reject)=>{
		fetchUrlByGET(cateUrl)
		.then(body=>{
			let $ = cheerio.load(body)
			let goodList = $('ul.list_pic>li.item').find('.goods-info');
			if(goodList.length== 24){
				let nextPage = $('.sort-bar>.pagination ul>li').eq(1)
				let ishasNextPage = $(nextPage).find('a').length > 0
				if(ishasNextPage){
					let nextPage = $(nextPage).find('a').attr('href')
					fetchGoodList(nextPage)
				}
			}
			return Promise.resolve(cateUrl)
		})
		.then(url=>{
			resolve(url)
		})
	})
}
let urlList = []
Promise.all(urlList.push(fetchGoodList(cateUrl)))
	.then(urlList =>{
		console.dir(urlList)
	})