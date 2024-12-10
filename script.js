document.addEventListener('DOMContentLoaded', function() {
    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');
    const translateBtn = document.getElementById('translateBtn');
    const sourceLanguage = document.getElementById('sourceLanguage');
    const targetLanguage = document.getElementById('targetLanguage');
    const startRecord = document.getElementById('startRecord');
    const recordStatus = document.getElementById('recordStatus');

    let recognition = null;
    let isRecording = false;

    // 初始化语音识别
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'zh-CN'; // 设置语音识别的语言

        recognition.onstart = function() {
            isRecording = true;
            startRecord.classList.add('recording');
            startRecord.innerHTML = '<span class="record-icon"></span>停止录音';
            recordStatus.textContent = '正在录音...';
            
            // 添加波形动画
            const waveContainer = document.createElement('div');
            waveContainer.className = 'wave-container active';
            for(let i = 0; i < 10; i++) {
                const bar = document.createElement('div');
                bar.className = 'wave-bar';
                waveContainer.appendChild(bar);
            }
            recordStatus.after(waveContainer);
        };

        recognition.onend = function() {
            isRecording = false;
            startRecord.classList.remove('recording');
            startRecord.innerHTML = '<span class="record-icon"></span>开始录音';
            recordStatus.textContent = '录音已结束';
            
            // 移除波形动画
            const waveContainer = document.querySelector('.wave-container');
            if(waveContainer) {
                waveContainer.remove();
            }
        };

        recognition.onresult = function(event) {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if(finalTranscript) {
                sourceText.value = finalTranscript;
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            recordStatus.textContent = '录音出错: ' + event.error;
            startRecord.classList.remove('recording');
            startRecord.innerHTML = '<span class="record-icon"></span>开始录音';
        };

        // 录音按钮点击事件
        startRecord.addEventListener('click', function() {
            if (!isRecording) {
                recognition.start();
            } else {
                recognition.stop();
            }
        });
    } else {
        startRecord.style.display = 'none';
        recordStatus.textContent = '您的浏览器不支持语音识别功能';
    }

    // 翻译功能
    translateBtn.addEventListener('click', async function() {
        if (!sourceText.value) {
            alert('请输入要翻译的文本！');
            return;
        }

        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText.value)}&langpair=${sourceLanguage.value}|${targetLanguage.value}`;

        try {
            translateBtn.disabled = true;
            translateBtn.textContent = '翻译中...';

            const response = await fetch(url);
            const data = await response.json();

            if (data.responseStatus === 200) {
                targetText.value = data.responseData.translatedText;
            } else {
                throw new Error('翻译失败');
            }
        } catch (error) {
            alert('翻译出错，请稍后重试！');
            console.error('Translation error:', error);
        } finally {
            translateBtn.disabled = false;
            translateBtn.textContent = '翻译';
        }
    });

    // 防止源语言和目标语言选择相同
    sourceLanguage.addEventListener('change', function() {
        if (sourceLanguage.value === targetLanguage.value) {
            targetLanguage.value = targetLanguage.options[
                (Array.from(targetLanguage.options).findIndex(opt => opt.value === sourceLanguage.value) + 1) 
                % targetLanguage.options.length
            ].value;
        }
        // 更新语音识别的语言
        if (recognition) {
            recognition.lang = sourceLanguage.value === 'zh' ? 'zh-CN' : 
                             sourceLanguage.value === 'en' ? 'en-US' :
                             sourceLanguage.value === 'ja' ? 'ja-JP' :
                             sourceLanguage.value === 'ko' ? 'ko-KR' : 'zh-CN';
        }
    });

    targetLanguage.addEventListener('change', function() {
        if (targetLanguage.value === sourceLanguage.value) {
            sourceLanguage.value = sourceLanguage.options[
                (Array.from(sourceLanguage.options).findIndex(opt => opt.value === targetLanguage.value) + 1)
                % sourceLanguage.options.length
            ].value;
        }
    });
}); 