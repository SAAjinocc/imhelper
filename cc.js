// ==UserScript==
// @name         cc端脚本
// @namespace    http://cc.saa.com.cn/
// @version      1.0.1
// @description  cc端的相关代码
// @author       郑士琳
// @match        cc.saa.com.cn/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL    https://raw.githubusercontent.com/SAAjinocc/imhelper/main/cc.js
// @downloadURL  https://raw.githubusercontent.com/SAAjinocc/imhelper/main/cc.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
    var selectorF = ".chat_msg_goods_info";
    var selectorS = ".goodInfoRight1"
    // 创建MutationObserver实例
    let iframe = document.createElement('iframe');
    let token = ""
    iframe.style.display = 'none';
    iframe.src = 'https://ssr.saa.com.cn/#/inner-search';
    let lock = false
    let ssrwin
    var observer = new MutationObserver(function (mutationsList) {
        // 遍历每个DOM变化
        for (var mutation of mutationsList) {
            // 检查新添加的节点
            if (mutation.type === 'childList') {
                // 获取所有新添加的匹配选择器父元素
                var elements = mutation.target.querySelectorAll(selectorF);
                // 遍历元素列表并修改父元素指針樣式
                elements.forEach(function (element) {
                    element.style.cursor = "auto";
                });
                elements = mutation.target.querySelectorAll(selectorS);
                elements.forEach(function (element) {
                    element.style.cursor = "pointer";
                    element.removeEventListener("click", clickHandler);
                    element.addEventListener('click', clickHandler)
                });
            }
        }
    });

    // 配置观察器以监视所需的变化类型
    var observerConfig = { childList: true, subtree: true };

    // 启动观察器并指定要观察的根节点
    observer.observe(document.body, observerConfig);

    function getToken(data){
        document.body.appendChild(iframe);
        iframe.onload = ()=>{
            iframe.contentWindow.postMessage({data,msg:'getToken'}, iframe.src);
        }
    }

    window.addEventListener('message', function(event) { //等待srr网站返回的token
        if (event.origin !== 'https://ssr.saa.com.cn') return;
        lock = false
        document.body.removeChild(iframe);
        console.log(event)
        if(event.data.error)return
        token = event.data.token
        tryOpen(event.data.data,true)
        console.log(token)
    // Remove the iframe

    }, false);

    function clickHandler(event) {
        if(lock)return;
        var order = event.target.textContent.match(/[:：]\s*(\S+)/)[1]
        lock = true
        console.log(ssrwin)
        var orderNumber = event.target.textContent.split(" ")[0].startsWith('案件号')? "":order
        var caseNo = event.target.textContent.split(" ")[0].startsWith('案件号')?order:""
        var now = new Date().getTime();
        var data = JSON.stringify({
            bookStartTime: formatDateTime(now-7*24*60*60*1000),
            bookStopTime: formatDateTime(now+3*24*60*60*1000),
            orderNumber,
            caseNo,
            pageSize: 20,
            pageIndex: 1
        })
        tryOpen(data,false)
        console.log('cn:'+caseNo+'\n'+'or'+orderNumber)
    }

    // 格式化日期和时间
    function formatDateTime(dateOrgin) {
        var date  = new Date(dateOrgin)
        var year = date.getFullYear();
        var month = ("0" + (date.getMonth() + 1)).slice(-2);
        var day = ("0" + date.getDate()).slice(-2);
        var hour = ("0" + date.getHours()).slice(-2);
        var minute = ("0" + date.getMinutes()).slice(-2);
        return year + "-" + month + "-" + day + " " + hour + ":" + minute;
    }


    function tryOpen(data,isFinal){
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://ssr.saa.com.cn/redirect-request/pg-search/order/query?access_token="+token+"&rid=d8pcw",
            headers: {
                "Content-Type": "application/json"
            },
            data,
            onload: function (response) {
                var res = JSON.parse(response.responseText);
                console.log(res)
                if(res.code == 401){
                    console.log('登录信息过期')
                    if(isFinal){
                        alert("请先登录SAA救援平台后重试")
                        console.log('cclogin')
                        window.open('https://ssr.saa.com.cn/');
                    }else{
                        getToken(data)
                    }
                    return
                }
                if(res.data.list.length == undefined || res.data.list.length == 0){
                    console.log(data)
                    data = JSON.parse(data)
                    GM_setClipboard(data.caseNo?data.caseNo:data.orderNumber);
                    lock = false
                    alert("查询此案件失败，已复制案件号，请手动查询。")
                    return
                }
                if(res.data.list.length>5){
                    data = JSON.parse(data)
                    GM_setClipboard(data.caseNo?data.caseNo:data.orderNumber);
                    lock = false
                    alert("查询结果大于5条，已复制案件号，请手动打开。")
                    return
                }
                res.data.list.forEach(function (i, index) {
                    setTimeout(() => {
                        if(ssrwin && !ssrwin.closed){
                            ssrwin.postMessage({msg:'open',id:i.id},'https://ssr.saa.com.cn')
                        }
                        else {
                            ssrwin = window.open('https://ssr.saa.com.cn/#/orderDetail?id=' + encodeURIComponent(i.id));
                        }
                    }, index * 500)
                });
                lock = false
            }
        });
    }

})();


