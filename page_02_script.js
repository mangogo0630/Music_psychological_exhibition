window.addEventListener("DOMContentLoaded", () => {
    const backgroundImage = document.querySelector(".background-image");
    const audio = document.getElementById("background-music");
    const overlayBackgrounds = {
        m01: document.querySelector(".overlay-background-1"),
        m02: document.querySelector(".overlay-background-2"),
        m03: document.querySelector(".overlay-background-3")
    };
    let clickedButtons = new Set();

    // 音樂控制初始化
    const musicIsPlaying = localStorage.getItem('musicIsPlaying') === 'true';
    const musicTime = localStorage.getItem('musicTime');
    
    if (musicTime) {
        audio.currentTime = parseFloat(musicTime);
    }
    
    if (musicIsPlaying) {
        audio.play().catch(error => {
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
    let totalButtons = 3;

    function updateScore(backgroundNumber) {
        let currentScore = parseInt(localStorage.getItem('testScore') || '0');
        
        switch(backgroundNumber) {
            case '1': // m01 - 消極
                currentScore += 1;
                break;
            case '2': // m02 - 佛系
                currentScore += 2;
                break;
            case '3': // m03 - 樂觀
                currentScore += 3;
                break;
        }
        
        localStorage.setItem('testScore', currentScore.toString());
    }

    if (backgroundImage) {
        setTimeout(() => {
            backgroundImage.classList.add("brightness");
            setTimeout(() => {
                createImageButtons();
                createControlButtons();
            }, 2000);
        }, 1000);
    }

    function createControlButtons() {
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "control-buttons";
        
        const confirmButton = document.createElement("img");
        confirmButton.src = "images/確定按鈕.png";
        confirmButton.className = "control-button confirm-button disabled";
        confirmButton.addEventListener("click", handleConfirm);
        
        const resetButton = document.createElement("img");
        resetButton.src = "images/重置按鈕.png";
        resetButton.className = "control-button reset-button";
        resetButton.addEventListener("click", handleReset);
        
        buttonContainer.appendChild(resetButton);
        buttonContainer.appendChild(confirmButton);
        document.body.appendChild(buttonContainer);
    }

    function createImageButtons() {
        [1, 2, 3].forEach((num, index) => {
            const buttonId = `m0${num}`;
            const image = document.createElement("img");
            image.src = `images/${buttonId}.png`;
            image.alt = `按鈕 ${num}`;
            image.id = buttonId;
            image.classList.add("fixed-image");
            document.body.appendChild(image);

            setTimeout(() => {
                image.classList.add("visible");
            }, index * 300);

            image.addEventListener("click", () => handleButtonClick(buttonId, image));
        });
    }

    function handleButtonClick(buttonId, image) {
        if (clickedButtons.has(buttonId)) {
            clickedButtons.delete(buttonId);
            image.classList.remove('clicked');
        } else if (clickedButtons.size < 2) {
            clickedButtons.add(buttonId);
            image.classList.add('clicked');
        }

        updateConfirmButtonState();
    }

    function updateConfirmButtonState() {
        const confirmButton = document.querySelector('.confirm-button');
        if (clickedButtons.size === 2) {
            confirmButton.classList.remove('disabled');
        } else {
            confirmButton.classList.add('disabled');
        }
    }

    function handleConfirm() {
        if (clickedButtons.size !== 2) return;

        const remainingButton = ['m01', 'm02', 'm03'].find(id => !clickedButtons.has(id));
        const bgIndex = remainingButton.charAt(2);
        
        const originalBg = document.querySelector('.background-image');
        if (originalBg) {
            originalBg.style.opacity = '0';
        }
        
        const overlayBg = document.querySelector(`.overlay-background-${bgIndex}`);
        if (overlayBg) {
            overlayBg.classList.add("visible");
            updateScore((parseInt(bgIndex)).toString());
        }

        clickedButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.remove();
            }
        });

        const controlButtons = document.querySelector('.control-buttons');
        if (controlButtons) {
            controlButtons.remove();
        }

        setTimeout(() => {
            createNextButton();
        }, 1000);
    }

    function handleReset() {
        clickedButtons.clear();
        document.querySelectorAll('.fixed-image').forEach(img => {
            img.classList.remove('clicked');
        });
        updateConfirmButtonState();
    }

    function createNextButton() {
        const nextPageButton = document.createElement("img");  // 改變變數名稱讓代碼更清楚
        nextPageButton.src = "images/下一頁按鈕.png";
        nextPageButton.className = "next-page-button";        // 改為 next-page-button
        document.body.appendChild(nextPageButton);
    
        nextPageButton.addEventListener("click", () => {
            const remainingButton = document.querySelector('.fixed-image');
            if (remainingButton) {
                remainingButton.style.transition = 'opacity 1s ease-out';
                remainingButton.style.opacity = '0';
                setTimeout(() => remainingButton.remove(), 1000);
            }
            
            nextPageButton.style.opacity = '0';
            
            const allBackgrounds = document.querySelectorAll('.background-image, .overlay-background-1, .overlay-background-2, .overlay-background-3');
            allBackgrounds.forEach(bg => {
                if(bg.style.opacity !== '0') {
                    bg.style.transition = 'opacity 1s ease-in-out';
                    bg.style.opacity = '0';
                }
            });
            
            setTimeout(() => {
                window.location.href = 'page_03.html';
            }, 1000);
        });
    }
});

// Add button styles
const style = document.createElement('style');
style.textContent = `


       .next-page-button {
        position: fixed;
        bottom: 50px;
        left: 50%;
        transform: translateX(-50%);
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s ease;
        animation: fadeIn 0.5s ease forwards;
        width: 80px;        /* 從 100px 改回 80px */
        height: auto;
        z-index: 1000;
    }

    .next-page-button:hover {
        transform: translateX(-50%) scale(1.1);
    }

    .control-button {
        width: 100px;
        height: auto;
        cursor: pointer;
        transition: transform 0.2s ease;
    }

    .control-button:hover {
        transform: scale(1.1);
    }

    .control-button.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .control-button.disabled:hover {
        transform: none;
    }

    .fixed-image {
        position: fixed;
        width: 120px;
        height: auto;
        transform: translate(-50%, -50%);
        transition: all 0.3s ease;
        cursor: pointer;
        opacity: 0;
    }

    .fixed-image.visible {
        opacity: 1;
    }

    .fixed-image:hover {
        transform: translate(-50%, -50%) scale(1.1);
    }

    .fixed-image.clicked {
        opacity: 0.5;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);