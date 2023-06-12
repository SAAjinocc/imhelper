// ==UserScript==
// @name         语音转文字（ASR）
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  用于辅助IM同事快速查看语音信息
// @author       郑士琳
// @match        cc.saa.com.cn/* 
// @updateURL    https://raw.githubusercontent.com/SAAjinocc/imhelper/main/asr.js
// @downloadURL  https://raw.githubusercontent.com/SAAjinocc/imhelper/main/asr.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    // 函数用于为特定元素添加按钮
    const addButton = function(element) {
        let audioItem = element.getElementsByClassName('audio_item')[0];
        // 创建新的 "转" 按钮
        let btn = document.createElement('BUTTON');
        btn.innerHTML = '转';
        element.appendChild(btn);
        
        // 点击按钮事件
        btn.addEventListener('click', function(){
            // 获取音频元素的源链接
            let audioSrc = audioItem.src;
            GM_xmlhttpRequest ( {
                method: 'GET',
                url: 'http://192.168.74.56:3000/im/asr' + '?url=' + encodeURIComponent(audioSrc),
                onload: function (res) {
                    // API返回的文本
                    let transcript = res.responseText;
                    // 在 div 元素下方创建一个新的 div，并添加文本
                    let transcriptDiv = document.createElement('div');
                    transcriptDiv.textContent = transcript;
                    element.appendChild(transcriptDiv);
                }
            } );
        });
    };

    const observer = new MutationObserver(function(mutationsList, observer) {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for(let node of mutation.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;
                    if (node.classList.contains('voice_content')) {
                        addButton(node);
                    } else {
                        for(let element of node.getElementsByClassName('voice_content')) {
                            addButton(element);
                        }
                    }
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
