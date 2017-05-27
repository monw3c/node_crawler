/*
 * 入口文件
 * mon 2017-1-1
 */
"use strict";
require("babel-core/register");
require("babel-polyfill");
let fs = require("fs");
let getFullPage = require("./js/getFullPage");

getFullPage.init()

process.once('beforeExit', (code) => {


    console.log(`退出了:` + code);
});