var fs = require("fs");
var path = require('path');

function mkdir(dirpath,dirname){  
        //判断是否是第一次调用  
        if(typeof dirname === "undefined"){   
            if(fs.existsSync(dirpath)){  
                return;  
            }else{  
                mkdir(dirpath,path.dirname(dirpath));  
            }  
        }else{  
            //判断第二个参数是否正常，避免调用时传入错误参数  
            if(dirname !== path.dirname(dirpath)){   
                mkdir(dirpath);  
                return;  
            }  
            if(fs.existsSync(dirname)){  
                fs.mkdirSync(dirpath)  
            }else{  
                mkdir(dirname,path.dirname(dirname));  
                fs.mkdirSync(dirpath);  
            }  
        }  
}  
// mkdir('/home/ec/a/b/c/d');  

exports.init = mkdir;