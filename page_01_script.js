console.clear();
gsap.registerPlugin(ScrollTrigger);

// 全局變量
const audio = document.getElementById("background-music");
const heroSection = document.querySelector(".section.hero");
const musicControlButton = document.getElementById('music-control');
const imgElement = document.getElementById("switchImage");
let isPlaying = false;
let isLastImage = false;
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let scrollProgress = 0; // 全局變量追蹤滾動進度

// 當 DOM 加載完成後初始化
window.addEventListener("DOMContentLoaded", () => {
    // 檢查是否是從第一頁來的（通過檢查 answerType）
    // const answerType = localStorage.getItem('answerType');
    
    // 如果直接重整頁面（沒有 answerType）就重置分數並跳回第一頁
    // if (!answerType) {
    //     localStorage.setItem('testScore', '0');
    //     window.location.href = 'page_00.html';
    //     return;
    // }

    // 先將所有元素設置為透明
    const wrapper = document.querySelector(".wrapper");
    wrapper.style.opacity = "0";
    
    // 添加延遲後的淡入效果
    setTimeout(() => {
        wrapper.style.transition = "opacity 1s ease-in-out";
        wrapper.style.opacity = "1";
    }, 100);

    // 檢查前一頁的音樂狀態並繼續播放
    const musicTime = localStorage.getItem('musicTime');
    const musicIsPlaying = localStorage.getItem('musicIsPlaying') === 'true';
    
    if (musicTime) {
        audio.currentTime = parseFloat(musicTime);
    }
    
    if (musicIsPlaying) {
        audio.play().then(() => {
            isPlaying = true;
        }).catch(error => {
            console.error("音樂播放失敗:", error);
        });
    }

    // 定期保存音樂時間
    setInterval(() => {
        if (!audio.paused) {
            localStorage.setItem('musicTime', audio.currentTime);
            localStorage.setItem('musicIsPlaying', 'true');
        } else {
            localStorage.setItem('musicIsPlaying', 'false');
        }
    }, 1000);

    // 其他初始化
    initBackgroundEffect();
    initScrollEffects();
    initClickableImage();
});

// 檢查圖片尺寸
function checkImageSizes() {
    const hero = document.querySelector(".section.hero");
    const foreground = document.querySelector(".foreground-image");
    
    console.log("Hero section size:", {
        width: hero.offsetWidth,
        height: hero.offsetHeight,
        computedStyle: window.getComputedStyle(hero)
    });
    
    console.log("Foreground image size:", {
        width: foreground.offsetWidth,
        height: foreground.offsetHeight,
        naturalWidth: foreground.naturalWidth,
        naturalHeight: foreground.naturalHeight,
        computedStyle: window.getComputedStyle(foreground)
    });
}

window.addEventListener("load", checkImageSizes);

// 背景效果初始化
function initBackgroundEffect() {
    const backgroundImage = document.querySelector(".background-image");
    if (backgroundImage) {
        setTimeout(() => {
            backgroundImage.classList.add("brightness");
        }, 500);
    }
}

// 初始化滾動效果
function initScrollEffects() {
    // 創建時間軸但先不啟用
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".wrapper",
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: true,
            preventScroll: true
        }
    });

    // 添加動畫但先不執行
    tl.to(".content .section.hero", {
        scale: 1.8,
        ease: "power1.inOut"
    })
    .to(".foreground-image", {
        scale: 2,
        ease: "power1.inOut"
    }, "<")
    .to(".foreground-image", {
        opacity: 0,
        ease: "power1.inOut"
    });

    // 禁用滾動
    document.body.style.overflow = 'hidden';
    // 避免手機彈性滾動造成視覺回彈
    document.documentElement.style.overscrollBehaviorY = 'none';
    document.body.style.touchAction = 'none';
    
    // 設置滾動事件監聽器
    window.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('touchmove', handleScroll, { passive: false });

    // 初始化浮動按鈕
    initFloatingButton("#floating-button-1", "bottom 50%", -10, 1.5);
    initFloatingButton("#floating-button-2", "bottom 25%", -8, 1.8);
    initFloatingButton("#floating-button-3", "bottom 30%", -7, 1.0);

    // 若在最上面，按鈕全部隱藏（避免初始或回頂時露出）
    const scrollProgressTrigger = ScrollTrigger.create({
        trigger: ".wrapper",
        start: "top top",
        end: "+=100%",
        onUpdate: (self) => {
            scrollProgress = self.progress;
            // 頂端時（progress <= 0.05）強制隱藏所有按鈕
            // 非頂端時，如果 isLastImage 為 false，需要 progress > 0.05 才顯示
            // 如果 isLastImage 為 true，可以顯示（但頂端時仍隱藏）
            const isAtTop = self.progress <= 0.05;
            const shouldShow = !isAtTop && (isLastImage || self.progress > 0.05);
            
            const buttons = document.querySelectorAll(".floating-button");
            buttons.forEach(btn => {
                if (shouldShow) {
                    // 顯示但不搶動畫控制
                    if (getComputedStyle(btn).display === 'none') {
                        btn.style.display = 'block';
                        btn.style.visibility = 'visible';
                    }
                } else {
                    // 強制隱藏：頂端時必須隱藏
                    btn.style.opacity = '0';
                    btn.style.display = 'none';
                    btn.style.visibility = 'hidden';
                }
            });
        }
    });

    // 當 isLastImage 為 true 後，監聽實際滾動位置（因為此時滾動已解鎖）
    const checkScrollPosition = () => {
        if (isLastImage) {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const isAtTop = scrollTop <= 10; // 允許 10px 的誤差
            
            if (isAtTop) {
                const buttons = document.querySelectorAll(".floating-button");
                buttons.forEach(btn => {
                    btn.style.opacity = '0';
                    btn.style.display = 'none';
                    btn.style.visibility = 'hidden';
                });
            }
        }
    };
    
    window.addEventListener('scroll', checkScrollPosition, { passive: true });
}

// 滾動處理函數
function handleScroll(e) {
    if (!isLastImage) {
        e.preventDefault();
        if (!document.getElementById('scrollHint')) {
            const hint = document.createElement('div');
            hint.id = 'scrollHint';
            hint.style.position = 'fixed';
            hint.style.bottom = '20px';
            hint.style.left = '50%';
            hint.style.transform = 'translateX(-50%)';
            hint.style.color = 'white';
            hint.style.padding = '10px';
            hint.style.backgroundColor = 'rgba(0,0,0,0.7)';
            hint.style.borderRadius = '5px';
            hint.style.zIndex = '1000';
            hint.textContent = isTouchDevice ? '點擊畫面，嘗試擊碎鏡子' : '點擊畫面，嘗試擊碎鏡子';
            document.body.appendChild(hint);
            
            setTimeout(() => {
                hint.remove();
            }, 3000);
        }
    }
}

// 浮動按鈕初始化
function initFloatingButton(buttonId, startPosition, yOffset, duration) {
    ScrollTrigger.create({
        trigger: ".section.hero",
        start: startPosition,
        endTrigger: ".new-background",
        onEnter: () => {
            // 只有在滾動進度足夠時才顯示按鈕
            if (scrollProgress > 0.05 && !isLastImage) {
                gsap.to(buttonId, { opacity: 1, duration: 1, display: "block", visibility: "visible" });
            }
        },
        onLeaveBack: () => {
            // 完成後（最後一張圖出現）不再隱藏，避免手機回彈把選項藏起來
            // 頂端時強制隱藏
            if (!isLastImage || scrollProgress <= 0.05) {
                gsap.to(buttonId, { 
                    opacity: 0, 
                    duration: 1,
                    onComplete: () => {
                        const btn = document.querySelector(buttonId);
                        if (btn) {
                            btn.style.display = 'none';
                            btn.style.visibility = 'hidden';
                        }
                    }
                });
            }
        }
    });

    gsap.to(buttonId, {
        y: yOffset,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        duration: duration
    });
}

// 點擊圖片初始化
function initClickableImage() {
    const images = [
        "images/鏡子示意圖-3_2.jpg",
        "images/鏡子示意圖-3_2.jpg",
        "images/鏡子-裂痕去背_2.png",
        "images/鏡子-無鏡片去背_2.png"
    ];
    let currentIndex = 0;

    if (imgElement) {
        imgElement.addEventListener("click", () => {
            if (currentIndex < images.length - 1) {
                currentIndex++;
                imgElement.src = images[currentIndex];
                gsap.to(imgElement, {
                    scale: 1.01,
                    duration: 0.2,
                    yoyo: true,
                    repeat: 1
                });
                
                if (currentIndex === images.length - 1) {
                    isLastImage = true;
                    // 解除鎖定與回彈抑制
                    document.body.style.overflow = 'auto';
                    document.documentElement.style.overscrollBehaviorY = '';
                    document.body.style.touchAction = '';
                    window.removeEventListener('wheel', handleScroll);
                    window.removeEventListener('touchmove', handleScroll);
                    // 小幅度自動滾動，讓手機不會因為彈回導致顯示狀態錯亂
                    setTimeout(() => {
                        window.scrollTo({ top: 1, behavior: 'smooth' });
                        if (ScrollTrigger && ScrollTrigger.refresh) {
                            ScrollTrigger.refresh();
                        }
                    }, 50);
                    
                    const scrollPrompt = document.createElement('div');
                    scrollPrompt.id = 'scrollPrompt';
                    scrollPrompt.style.position = 'fixed';
                    scrollPrompt.style.bottom = '20px';
                    scrollPrompt.style.left = '50%';
                    scrollPrompt.style.transform = 'translateX(-50%)';
                    scrollPrompt.style.color = 'white';
                    scrollPrompt.style.padding = '10px';
                    scrollPrompt.style.backgroundColor = 'rgba(0,0,0,0.7)';
                    scrollPrompt.style.borderRadius = '5px';
                    scrollPrompt.style.zIndex = '2000';
                    scrollPrompt.textContent = isTouchDevice ? '手指向下滑，進入鏡子內部' : '滾動滑鼠，進入鏡子內部';
                    document.body.appendChild(scrollPrompt);
                    
                    setTimeout(() => {
                        scrollPrompt.remove();
                    }, 3000);
                }
            }
        });
    }
}

// 按鈕點擊處理
function handleButtonClick(button) {
    // 根據按鈕 ID 設置分數
    let score;
    switch(button.id) {
        case 'floating-button-3': // eye_01.png - 樂觀型
            score = 3; 
            break;
        case 'floating-button-2': // eye_02.png - 佛系型
            score = 2;  
            break;
        case 'floating-button-1': // eye_03.png - 消極型
            score = 1;  
            break;
    }
    
    // 從 localStorage 獲取當前總分，如果沒有就設為0
    let currentTotal = parseInt(localStorage.getItem('testScore')) || 0;
    currentTotal += score;
    localStorage.setItem('testScore', currentTotal);

    // 先讓其他按鈕慢慢消失
    const allButtons = document.querySelectorAll(".floating-button");
    allButtons.forEach(btn => {
        if (btn !== button) {
            gsap.to(btn, {
                scale: 0.8,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out"
            });
        }
    });
    
    // 延遲後再讓被點擊的按鈕和背景消失
    setTimeout(() => {
        const heroSection = document.querySelector(".section.hero");
        heroSection.classList.add("dark");
        
        gsap.to(button, {
            scale: 0.8,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            onComplete: () => {
                setTimeout(() => {
                    // 保存音樂狀態後跳轉
                    localStorage.setItem('musicTime', audio.currentTime);
                    localStorage.setItem('musicIsPlaying', !audio.paused);
                    window.location.href = "page_02.html";
                }, 1500);
            }
        });
        
        gsap.to(".foreground-image", {
            opacity: 0,
            duration: 1,
            ease: "power2.out"
        });
    }, 500);
}

// 離開頁面前保存音樂狀態
window.addEventListener('beforeunload', () => {
    localStorage.setItem('musicTime', audio.currentTime);
    localStorage.setItem('musicIsPlaying', !audio.paused);
});

// 圖片尺寸調整
window.addEventListener('load', () => {
    const heroSection = document.querySelector('.section.hero');
    const foregroundImage = document.querySelector('.foreground-image');
    
    const computedStyle = window.getComputedStyle(heroSection);
    const bgWidth = heroSection.offsetWidth;
    const bgHeight = heroSection.offsetHeight;
    
    foregroundImage.style.width = `${bgWidth}px`;
    foregroundImage.style.height = `${bgHeight}px`;
});