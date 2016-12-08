const path = require('path')
const fs = require('fs')
const testDir = path.join(__dirname, '测试目录')
if (fs.existsSync(testDir)) {
         console.log('已经创建过此更新目录了');
     } else {
         fs.mkdirSync(testDir);
         console.log('更新目录已创建成功\n');
     }