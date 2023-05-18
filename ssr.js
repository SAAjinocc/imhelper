// ==UserScript==
// @name         srr端脚本
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  respond with variable to site A
// @match        https://ssr.saa.com.cn/*
// @grant        GM_xmlhttpRequest
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