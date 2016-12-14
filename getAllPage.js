const {fetchUrlByGET,getNow} = require('./method')
const cheerio = require('cheerio')
const request = require('request')
const cateUrl = 'http://yuchai.weilian.cn/shop/index.php?act=search&op=index&cate_id=12';

//let arr = [fetchGoodList(cateUrl1),fetchGoodList(cateUrl2),fetchGoodList(cateUrl3)]
function fetchGoodList(cateUrl) {
	let urlList = []
	let pageIdx = 0;
	function forEachPage(cateUrl) {
			pageIdx++;
			console.log('正在请求第'+pageIdx+'页')
				request({url:cateUrl},function (err, res, body) {
					if(!err){
						let $ = cheerio.load(body)
						urlList.push(cateUrl)
						let goodList = $('ul.list_pic>li.item').find('.goods-info');
							if(goodList.length== 24){
							let nextPage = $('.sort-bar>.pagination ul>li').eq(1)
							let ishasNextPage = $(nextPage).find('a').length > 0
							if(ishasNextPage){
								let nextPageUrl = $(nextPage).find('a').attr('href')
								forEachPage(nextPageUrl)
							}
						}else{
						}
					}
				})
			}
	return Promise.all(urlList)
	
}
fetchGoodList(cateUrl).then(data=>console.dir(data))