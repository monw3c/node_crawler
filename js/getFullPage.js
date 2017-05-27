/*
 * 取得总页数
 * mon 2016-12-14
 */
"use strict";
let superagent = require('superagent');
let cheerio = require("cheerio");
let config = require("./config");
let fs = require("fs");
let path = require("path");
let sleep = require("./sleep");
let renderDetail = require("./renderDetail");
let charset = require("superagent-charset");
var saproxy = require('superagent-proxy');
let async = require('async');
let _ = require('underscore'); 
let proxyFinder = require("./proxyFinder");
charset(superagent);
saproxy(superagent);

    function randomIP(){
      return _.random(1 , 254) + "." + _.random(1 , 254) + "." + _.random(1 , 254) + "." + _.random(1 , 254)  
    }

    function randomDelay(){
      var a = parseInt((Math.random() * 10000000) % 25000, 10)
      return a < 12000 ? 15000 : a
    }

    // 解析<script>内容
    function findTextAndReturnRemainder(target, variable){
        var chopFront = target.substring(target.search(variable)+variable.length,target.length);
        var result = chopFront.substring(0,chopFront.search(";"));
        return result;
    }

    // 读取总页数
    var getFullPage = function (){

      return new Promise(function (resolve, reject){
        var url = config.requestUrl;
        superagent.get(url).set({
          'Referer': url,
          'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36",
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "text/html, application/xhtml+xml, */*"
        }).end(function(err, response) {
          if (err) {
            reject(err.status)
            console.log(err.status);
          }
          //console.log(ip);
          //if (response.status === 200) {
            var $ = cheerio.load(response.text);
          //}
          var text = $($('script')).text();
          var pages = findTextAndReturnRemainder(text, "var pageCount = ")
          config.fullPage = pages;
          resolve(config.fullPage);
          //console.log(config.fullPage);
        })
      });
    };

    // 取得所有链接
    var getAllLinks = function (i){
        //console.log(proxy);
        return new Promise(function (resolve, reject){
              var tempLinks = [];//缓存当前页的链接   
              var url = `http://scjg.huizhou.gov.cn/html/corpList.shtml?pageNo=${i}`;
              //console.log(url)
              superagent.get(url).set({
                'Referer': url,
                'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "text/html, application/xhtml+xml, */*"
              }).end(function(err, response) {
                if (err) {
                  reject(err.status)
                  console.log(err.status);
                }
                
                //if (response.status === 200) {
                  var $ = cheerio.load(response.text);
                  tempLinks = []
                  //resolve($);
                  $('table[bgcolor=#B5DAFF]').eq(1).find('tr').each(function (i, e) {
                      //resolve(e);
                      if (i === 0) return;
                      var href = $(e).find('td a').attr('href')
                      tempLinks.push(config.host+href)
                      //console.log(tempLinks)
                      
                   })
                  resolve(tempLinks)
                //}
                
              })

          })

    };


    //创建文件
    var writeFile = function (fileName,links){
      return new Promise(function (resolve, reject){
        fs.writeFile( fileName+'.txt' , links , 'utf-8',function (err,data) {    
            if (err) reject(err);
            resolve(data);
            //console.log('links已保存～');
        })
      })
    }

    //读取所有links先存起来
    var appendFile = function (fileName,links){
      return new Promise(function (resolve, reject){
        fs.appendFile( fileName+'.txt' , links , 'utf-8',function (err,data) {    
            if (err) reject(err);
            resolve(data);
            //console.log('已添加～');
        })
      })
    }

    var readFile = function (fileName){
      return new Promise(function (resolve, reject){
        fs.readFile(fileName, "utf-8",function (err,data) {    
            if (err) reject(err);
            resolve(data);
            //console.log(`${fileName}已读取～`);
        })
      })
    }

    function readLines(file,func) {
      return new Promise(function (resolve, reject){
        var remaining = '';
        file.on('data', function(data) {
          remaining += data;
          //console.log(`大文件～`);
          func(data)
        });

        file.on('end', function() {
          //console.log(`大文件～+`+remaining);
          
        });
      })
    }


    var init = async function (){
      try {
          //await writeFile('links','');
          //var line1 = `'登记事项#统一社会信用代码/注册号','企业状态','名称','住所','注册资本','币种','法定代表人','商事主体类型','成立日期','核准日期','投资者信息','隶属企业名称','登记机关','备案事项#公司秘书','高级管理人员','经营场所'\n\n`
          //await writeFile('result',line1);
          // let proxys = await readFile('proxy.json');
          // let httpArr = await JSON.parse(proxys).http;
          // //let proxy = "";
          // let proxystr = await httpArr[Math.floor(Math.random()*httpArr.length+1)-1]//await httpArr.toString().replace(/\,/g,'||');
          await getFullPage().then((r)=>{
            config.fullPage = parseInt(r)
          });
          console.log(config.fullPage);
          let now = await readFile('nowPage.txt');
          if (now&&now!="") {
            for (let i = now; i <= config.fullPage; i++) {
               var l=""; config.nowPage = i;
               var count = i%10//10页暂停避开反机器人
               if (i == 1) {
                  var line1 = `'登记事项#统一社会信用代码/注册号','企业名称','企业类型','法定代表人','经营场所','成立日期','经营范围','核准日期'\n\n`
                  await writeFile('result',line1);
               }
               if (count == 0) {
                  console.log(`停一下`)
                  await sleep.go(randomDelay())//10秒
               }
                 console.log(`第${i}页爬取..`);
                 await sleep.go(15000)//10秒
                 l = await getAllLinks(i);
                 //console.log(`${l}`)
                 console.log("链接读取完，隔"+randomDelay()+"秒开始扒");
                 await sleep.go(randomDelay())//.then(renderDetail.init(l.toString().split(',')));
                 await async.mapLimit(l.toString().split(','), 20, (url,callback) => {
                        //console.log(url)
                        renderDetail.init(url,callback)

                 }, function (err, result) {
                        //console.log(result)
                 });
                 
                await appendFile('links',l)

            }
          } else {
            console.log(`nowPage没了${config.nowPage}`)
          }
      } catch (e) {
        console.log(e);
      }


      
    };


exports.init = init;