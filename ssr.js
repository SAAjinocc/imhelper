// ==UserScript==
// @name         srr端脚本
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       郑士琳
// @description  ssr端的相关代码
// @match        https://ssr.saa.com.cn/*
// @updateURL    https://raw.githubusercontent.com/SAAjinocc/imhelper/main/ssr.js
// @downloadURL  https://raw.githubusercontent.com/SAAjinocc/imhelper/main/ssr.js
// ==/UserScript==

// Listen for messages from the parent page
window.addEventListener('message', function(event) {
    console.log(event)
    //if (event.origin !== 'http://www.sitea.com') return;



    if (event.data.msg === 'getToken') {
        // Get the variable from localStorage
        console.log('getTokening')
        let vuex = JSON.parse(localStorage.getItem('vuex'));
        if (vuex == undefined){
            console.log('srrlogin')
            alert("请先登录SAA救援平台。")
            window.open('https://ssr.saa.com.cn/');
            event.source.postMessage({error:true}, event.origin);
        }
        else  {
            event.source.postMessage({token:vuex.token,data:event.data.data}, event.origin);
        }
        console.log(vuex,vuex.token)
        // Send a message to the parent page
    }

}, false);