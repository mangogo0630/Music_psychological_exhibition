// preload-manager.js
class PreloadManager {
    constructor(showProgress = false) {
        this.imageList = [
            'images/開頭_bg.jpg',
            'images/輸入名字.png',
            'images/go按鈕_name.png',
            'images/聲音icon.png',
            'images/靜音icon.png',
            'images/鏡子-底圖.jpg',
            'images/問題1.png',
            'images/next.png',
            'images/回答1.png',
            'images/回答2.png',
            'images/回答3.png',
            'images/星空背景.jpg',
            'images/消極.png',
            'images/佛系.png',
            'images/樂觀.png',
            'images/首頁.png',
            'images/下載圖片.png',
            'images/領取專屬音樂.png',
            'images/純題目.png',
            'images/happy_bg.jpg',
            'images/sad_bg.jpg',
            'images/笑臉.png',
            'images/苦瓜臉.png',
            'images/確定按鈕.png',
            'images/進度條_bg.png',
            'images/羽毛.png',
            'images/確定按鈕_2.png',
            'images/coffee_bg.png',      // 咖啡廳背景
            'images/coffee_bg_2.png',    // 咖啡廳背景2
            'images/coffee_bg_3.png',    // 咖啡廳背景3
            'images/coffee_bg_4.png',    // 咖啡廳背景4
            'images/eyes-底圖.jpg',      // 眼睛背景
            'images/eye_01.png',         // 眼睛1
            'images/eye_02.png',         // 眼睛2
            'images/eye_03.png',         // 眼睛3
            'images/m01.png',            // 咖啡廳按鈕1
            'images/m02.png',            // 咖啡廳按鈕2
            'images/m03.png',            // 咖啡廳按鈕3
            'images/鏡子示意圖-2_2.jpg',
            'images/鏡子示意圖-3_2.jpg',
            'images/鏡子-裂痕去背_2.png',
            'images/鏡子-無鏡片去背_2.png',
            'images/重置按鈕.png',    // page_02 的重置按鈕
            'images/下一頁按鈕.png',  // page_02 的下一頁按鈕
        ];
        
        this.audioList = [
            'music/music.mp3'
        ];
        
        this.loadedResources = 0;
        this.totalResources = this.imageList.length + this.audioList.length;
        this.showProgress = showProgress;
        this.progressElement = null;
    }

    updateProgress() {
        if (!this.showProgress) return;
        
        const progress = (this.loadedResources / this.totalResources) * 100;
        if (this.progressElement) {
            this.progressElement.textContent = `載入中... ${Math.round(progress)}%`;
        }
    }

    async preloadImages() {
        const promises = this.imageList.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.loadedResources++;
                    this.updateProgress();
                    resolve(img);
                };
                img.onerror = () => {
                    console.error(`Failed to load image: ${src}`);
                    resolve(); // Still resolve to not block other loads
                };
                img.src = src;
            });
        });

        await Promise.all(promises);
    }

    async preloadAudio() {
        const promises = this.audioList.map(src => {
            return new Promise((resolve, reject) => {
                const audio = new Audio();
                audio.oncanplaythrough = () => {
                    this.loadedResources++;
                    this.updateProgress();
                    resolve(audio);
                };
                audio.onerror = () => {
                    console.error(`Failed to load audio: ${src}`);
                    resolve(); // Still resolve to not block other loads
                };
                audio.src = src;
            });
        });

        await Promise.all(promises);
    }

    async preloadAll() {
        if (this.showProgress) {
            this.progressElement = document.getElementById('load-progress');
        }
        
        try {
            await Promise.all([
                this.preloadImages(),
                this.preloadAudio()
            ]);
            return true;
        } catch (error) {
            console.error('Preload failed:', error);
            return false;
        }
    }
}

// 页面转场管理器
class TransitionManager {
    constructor() {
        this.createOverlay();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: black;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.5s ease;
            z-index: 1000;
            pointer-events: none;
        `;
        document.body.appendChild(this.overlay);
    }

    async fadeOut() {
        this.overlay.style.visibility = 'visible';
        this.overlay.style.opacity = '1';
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    fadeIn() {
        this.overlay.style.opacity = '0';
        setTimeout(() => {
            this.overlay.style.visibility = 'hidden';
        }, 500);
    }
}

// 导出
window.PreloadManager = PreloadManager;
window.TransitionManager = TransitionManager;