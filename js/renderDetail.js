/*
 * 根据url爬起详细
 * mon 2016-12-16
 */
 "use strict";
let superagent = require('superagent');
let fs = require("fs");
let cheerio = require("cheerio");
let folder = require("./folder");
let rf = require("./removefolder");
let config = require("./config");
let sleep = require("./sleep");
let charset = require("superagent-charset");
var saproxy = require('superagent-proxy');
let async = require('async');
let _ = require('underscore'); 
charset(superagent);
saproxy(superagent);


  function randomIP(){
    return _.random(1 , 254) + "." + _.random(1 , 254) + "." + _.random(1 , 254) + "." + _.random(1 , 254)  
  }

  var init = async function (arr){

      //读取links.txt，遍历链接读取详情，生成对应的txt文件
      //await Promise.all(arr.map(async (e) => {
      //arr.forEach(function(e,i){
        //console.log(arr)
        async.mapLimit(arr, 10, (url,callback) => {
          console.log(url)
          // await detailHandler(url);
          // await sleep(1000);
          callback(null,`${url}读完\n`)
        }, function (err, result) {
          console.log(result)
        });
        
      //}))

  }

  var concurrencyCount = 0;
  var test = function (url) {
    return new Promise(function (resolve, reject){
      var delay = parseInt((Math.random() * 10000000) % 2000, 10);
      concurrencyCount++;
      console.log('现在的并发数是', concurrencyCount, '，正在抓取的是', url, '，耗时' + delay + '毫秒');
      setTimeout(function () {
        concurrencyCount--;
        //callback(null, url + ' html content');
      }, delay);
    })
  }

  // 解析<script>内容
  function findTextAndReturnRemainder(target, variable){
      var chopFront = target.substring(target.search(variable)+variable.length,target.length);
      var result = chopFront.substring(0,chopFront.search(";"));
      return result;
  }


  function detailHandler(url,callback){
        
        return new Promise(function (resolve, reject){
              //var ip =  _.random(1 , 254) + "." + _.random(1 , 254) + "." + _.random(1 , 254) + "." + _.random(1 , 254);
              superagent.get(url).set({
                'Referer': url,
                'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "text/html, application/xhtml+xml, */*"
              }).end(function(err, response) {
                if (err) {
                  reject(err.status)
                  console.log(err.status);
                  //console.log(config.nowPage);
                }
                //console.log(ip);
                //if (response.status === 200) {
                  var $ = cheerio.load(response.text);
                  var table = $('.tab_view table').eq(0);
                  var tr = table.find('tr');
                  var result = "";

                  var name = tr.eq(0).find('td').eq(1).text();
                  var code = tr.eq(1).find('td').eq(1).text();
                  var leixing = tr.eq(6).find('td').eq(1).text().replace(/^\s+|\s+$/g,"")
                  var faren = tr.eq(4).find('td').eq(1).text().replace(/^\s+|\s+$/g,"")
                  var addr = tr.eq(11).find('td').eq(1).text().replace(/^\s+|\s+$/g,"")
                  var chengliriqi = tr.eq(3).find('td').eq(1).text().replace(/^\s+|\s+$/g,"")
                  var jingyingfanwei = tr.eq(6).find('td').eq(3).text().replace(/^\s+|\s+$/g,"")
                  var hezhunriqi = tr.eq(8).find('td').eq(3).text().replace(/^\s+|\s+$/g,"")
                  
                  result = "'"+ code + "','"+ name +"','" + leixing +"','" + faren +"','" + addr +"','" + chengliriqi +"','" + jingyingfanwei +"','" + hezhunriqi +"'"+`\n\n`
                  //console.log(result);
                  fs.appendFile('result.txt' , result , 'utf-8',function (err,data) {    
                                    if (err) console.log(err);
                                    //resolve(data);
                                    //console.log(d+'已保存～');
                  })
                  fs.writeFile( 'nowPage.txt' , config.nowPage , 'utf-8',function (err,data) {  
                                if (err) console.log(err);    
                                //console.log(`render.nowPage:`+data);
                          })
                  callback(null,`${result}写入`)
                
              })
          //resolve()
                
        })

  }

exports.init = detailHandler;
