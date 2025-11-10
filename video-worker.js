// video-worker.js
try {
    // 首先導入 FFmpeg
    importScripts('https://cdnjs.cloudflare.com/ajax/libs/ffmpeg.js/0.10.0/ffmpeg.min.js');
    
    self.onmessage = async function(e) {
        const { imageData, musicPath, userName } = e.data;
        
        try {
            // 發送開始進度
            self.postMessage({
                type: 'progress',
                progress: 10
            });

            // 創建 FFmpeg 實例
            const ffmpeg = FFmpeg.createFFmpeg({ 
                log: true
            });
            
            // 發送加載進度
            self.postMessage({
                type: 'progress',
                progress: 30
            });

            await ffmpeg.load();
            
            // 將圖片數據寫入
            const imageBuffer = await fetch(imageData).then(r => r.arrayBuffer());
            ffmpeg.FS('writeFile', 'input.png', new Uint8Array(imageBuffer));
            
            // 發送圖片處理進度
            self.postMessage({
                type: 'progress',
                progress: 50
            });

            // 獲取音頻文件
            const audioResponse = await fetch(musicPath);
            const audioBuffer = await audioResponse.arrayBuffer();
            ffmpeg.FS('writeFile', 'audio.mp3', new Uint8Array(audioBuffer));
            
            // 發送音頻處理進度
            self.postMessage({
                type: 'progress',
                progress: 70
            });

            // 運行 FFmpeg 命令
            await ffmpeg.run(
                '-loop', '1',
                '-i', 'input.png',
                '-i', 'audio.mp3',
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-tune', 'stillimage',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-shortest',
                '-pix_fmt', 'yuv420p',
                '-movflags', '+faststart',
                'output.mp4'
            );
            
            // 發送編碼進度
            self.postMessage({
                type: 'progress',
                progress: 90
            });

            // 讀取生成的視頻
            const data = ffmpeg.FS('readFile', 'output.mp4');
            
            // 創建視頻 URL
            const blob = new Blob([data.buffer], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            
            // 發送完成進度和URL
            self.postMessage({
                type: 'progress',
                progress: 100
            });
            
            self.postMessage({
                type: 'done',
                url: url
            });
            
        } catch (error) {
            console.error('Worker error:', error);
            self.postMessage({
                type: 'error',
                error: error.message
            });
        }
    };
} catch (error) {
    console.error('Worker initialization error:', error);
    self.postMessage({
        type: 'error',
        error: error.message
    });
}