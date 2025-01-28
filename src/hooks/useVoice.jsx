import { useCallback } from 'react';
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let source = null;

export const useVoice = () => {
    const playOrStop = useCallback((data) => {
        //若audioContext进程被暂停，则启用audioContext 
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        if (source) {
            // 如果正在播放，停止播放
            source.stop();
            source.disconnect();
            source = null;
        } else {
            // 如果没在播放，开始播放
            audioContext.decodeAudioData(new Uint8Array(data).buffer, (buffer) => {
                source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.start();
                source.onended = () => {
                    source.disconnect();
                    source = null;
                };
            });
        }
    });

    return playOrStop;
};
