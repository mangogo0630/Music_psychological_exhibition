// music-controller.js

document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById("background-music");
    const musicControlButton = document.getElementById('music-control');
    let isPlaying = false;

    // 檢查是否為首頁
    const isIndexPage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname.endsWith('/');
    
    // 檢查是否為結果頁面
    const isResultPage = window.location.pathname.endsWith('result.html');

    // 初始化音樂狀態
    if (isIndexPage) {
        // 首頁預設暫停
        audio.pause();
        localStorage.setItem('musicIsPlaying', 'false');
        musicControlButton.style.backgroundImage = "url('images/聲音icon.png')";
    } else if (isResultPage) {
        // 結果頁面根據測驗分數選擇對應音樂
        const testScore = parseInt(localStorage.getItem('testScore')) || 0;
        
        // 根據分數選擇音樂
        let musicSrc = '';
        if (testScore >= 9) {
            musicSrc = 'music/積極型.mp3';
        } else if (testScore >= 7) {
            musicSrc = 'music/佛系型.mp3';
        } else {
            musicSrc = 'music/消極型.mp3';
        }
        
        // 設置音樂源
        audio.src = musicSrc;
        
        // 設置初始狀態
        audio.pause();
        musicControlButton.style.backgroundImage = "url('images/聲音icon.png')";
        localStorage.setItem('musicIsPlaying', 'false');
    } else {
        // 其他頁面檢查前一頁的狀態
        const musicTime = localStorage.getItem('musicTime');
        const musicIsPlaying = localStorage.getItem('musicIsPlaying') === 'true';
        
        if (musicTime) {
            audio.currentTime = parseFloat(musicTime);
        }
        
        if (musicIsPlaying) {
            audio.play().then(() => {
                isPlaying = true;
                musicControlButton.style.backgroundImage = "url('images/靜音icon.png')";
            }).catch(error => {
                console.error("音樂播放失敗:", error);
            });
        } else {
            musicControlButton.style.backgroundImage = "url('images/聲音icon.png')";
        }
    }

    // 音樂控制按鈕點擊處理
    musicControlButton.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            musicControlButton.style.backgroundImage = "url('images/聲音icon.png')";
            localStorage.setItem('musicIsPlaying', 'false');
        } else {
            audio.play()
                .then(() => {
                    musicControlButton.style.backgroundImage = "url('images/靜音icon.png')";
                    localStorage.setItem('musicIsPlaying', 'true');
                })
                .catch(error => {
                    console.error("音樂播放失敗:", error);
                    isPlaying = false;
                });
        }
        isPlaying = !isPlaying;
    });

    // 定期保存音樂時間
    setInterval(() => {
        if (!audio.paused) {
            localStorage.setItem('musicTime', audio.currentTime);
        }
    }, 1000);

    // 頁面離開前保存音樂狀態
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('musicTime', audio.currentTime);
        localStorage.setItem('musicIsPlaying', !audio.paused);
    });
});