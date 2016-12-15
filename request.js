function getAllPage(firstPage) {
	let pages = []
	return new Promise(resolve=>{
		!function currPage(url) {
			pages.push(url)

			promiseRequest(url) //请求页面 -- 封装的promise-request方法
				.then(body=>{
					.... //一些代码 判断是否有下一页
					if(nextPage){
						return Promise.reject(nextPage)
						//currPage(nextPage)
					}else {
						return Promise.resolve(pages)
					}
				})
				.then(pages=>{
					resolve(pages)
				})
				.catch(nextPage=>{
					currPage(nextPage)
				})
		}(firstPage)
	})
}