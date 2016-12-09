const fs = require('fs')
const path = require('path')
const testPath = path.join(__dirname,'appendfile.txt')

var i = 0;
var timer = setInterval(function () {
	if(fs.existsSync(testPath)){
		fs.appendFile(testPath, i+'\n', 'utf-8', (err)=>{
			if(err){
				console.error('appendfile error '+ err)
			}else{
				console.log('append to file ',i)
			}
		});
	}else{
		console.log('文件不存在')
		fs.writeFile(testPath, i+'\n', 'utf-8', (err)=>{
			if(err){
				console.error('writefile error '+ err)
			}else{
				console.log('create file')
			}
		});
	}
	i++;
}, 500)
setTimeout(function () {
	clearInterval(timer);
	console.log('写完了')
}, 20000)