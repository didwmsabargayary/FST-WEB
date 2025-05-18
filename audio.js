// Audio player functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create audio player controls if they don't exist
    if (!document.querySelector('.audio-controls')) {
        createAudioControls();
    }
    
    // Initialize audio player
    initAudioPlayer();
    
    const audio = document.getElementById('background-music');
    
    // Initialize audio state from localStorage
    const savedPosition = parseFloat(localStorage.getItem('musicPosition') || '0');
    if (savedPosition > 0) {
        audio.currentTime = savedPosition;
    }
    
    const storedVolume = localStorage.getItem('musicVolume');
    if (storedVolume) {
        audio.volume = parseFloat(storedVolume);
    }
    
    // Always set music to play by default
    localStorage.setItem('musicPlaying', 'true');
    
    // Try to play the audio
    audio.play().catch(e => {
        console.log('Auto-play prevented by browser:', e);
    });
    
    // Add a click event listener to the document to enable audio on first user interaction
    document.addEventListener('click', function audioEnableOnClick() {
        if (audio.paused && localStorage.getItem('musicPlaying') === 'true') {
            audio.play().then(() => {
                console.log('Audio started after user interaction');
            }).catch(e => {
                console.log('Failed to play audio after interaction:', e);
            });
        }
        document.removeEventListener('click', audioEnableOnClick);
    }, { once: true });
    
    // Save current position and state periodically
    setInterval(function() {
        if (!audio.paused) {
            localStorage.setItem('musicPosition', audio.currentTime.toString());
            localStorage.setItem('musicVolume', audio.volume.toString());
        }
    }, 1000);
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            if (!audio.paused) {
                localStorage.setItem('musicPlaying', 'true');
            }
        } else {
            if (localStorage.getItem('musicPlaying') === 'true') {
                audio.play().catch(e => console.log('Auto-play prevented:', e));
            }
        }
    });
});

function createAudioControls() {
    // Create audio element
    const audioElement = document.createElement('audio');
    audioElement.id = 'background-music';
    audioElement.src = 'DIDWMSA.mp3'; // Death theme music file
    audioElement.loop = true;
    audioElement.preload = 'auto'; // Preload audio for faster playback
    
    // Set volume from localStorage or default to 70%
    const savedVolume = parseFloat(localStorage.getItem('musicVolume') || '0.7');
    audioElement.volume = savedVolume;
    localStorage.setItem('musicVolume', savedVolume.toString());
    
    document.body.appendChild(audioElement);
    
    // Create audio controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'audio-controls';
    
    // Create play/pause button with animation
    const playPauseBtn = document.createElement('button');
    playPauseBtn.id = 'play-pause-btn';
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    playPauseBtn.title = 'Play/Pause';
    playPauseBtn.style.animationDelay = '0.1s';
    
    // Create mute button with animation
    const muteBtn = document.createElement('button');
    muteBtn.id = 'mute-btn';
    muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    muteBtn.title = 'Mute/Unmute';
    muteBtn.style.animationDelay = '0.2s';
    
    // Create volume slider
    const volumeContainer = document.createElement('div');
    volumeContainer.className = 'volume-slider-container';
    volumeContainer.style.animationDelay = '0.3s';
    
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '1';
    volumeSlider.step = '0.01';
    volumeSlider.value = savedVolume;
    volumeSlider.className = 'volume-slider';
    volumeSlider.title = 'Volume';
    
    volumeContainer.appendChild(volumeSlider);
    
    // Add event listener for volume slider
    volumeSlider.addEventListener('input', function() {
        audioElement.volume = this.value;
        localStorage.setItem('musicVolume', this.value);
        
        // Update mute button icon based on volume
        if (parseFloat(this.value) === 0) {
            muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    });
    
    // Add buttons and slider to container
    controlsContainer.appendChild(playPauseBtn);
    controlsContainer.appendChild(muteBtn);
    controlsContainer.appendChild(volumeContainer);
    
    // Add container to body with animation
    document.body.appendChild(controlsContainer);
    
    // Add animation class to each button
    setTimeout(() => {
        playPauseBtn.classList.add('animated');
        muteBtn.classList.add('animated');
        volumeContainer.classList.add('animated');
    }, 100);
}

function initAudioPlayer() {
    const audio = document.getElementById('background-music');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const muteBtn = document.getElementById('mute-btn');
    
    // Check if audio was playing in previous page (using localStorage)
    const isPlaying = localStorage.getItem('musicPlaying') === 'true';
    const isMuted = localStorage.getItem('musicMuted') === 'true';
    
    // Set initial state
    if (isPlaying) {
        audio.play().catch(e => console.log('Auto-play prevented:', e));
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
    
    if (isMuted) {
        audio.muted = true;
        muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        audio.muted = false;
        muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
    
    // Play/Pause button event
    playPauseBtn.addEventListener('click', function() {
        if (audio.paused) {
            audio.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            localStorage.setItem('musicPlaying', 'true');
        } else {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            localStorage.setItem('musicPlaying', 'false');
        }
    });
    
    // Mute button event
    muteBtn.addEventListener('click', function() {
        if (audio.muted) {
            audio.muted = false;
            muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            localStorage.setItem('musicMuted', 'false');
            
            // Restore previous volume
            const savedVolume = parseFloat(localStorage.getItem('musicVolume') || '0.7');
            audio.volume = savedVolume;
        } else {
            // Save current volume before muting
            localStorage.setItem('musicVolume', audio.volume.toString());
            
            audio.muted = true;
            muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            localStorage.setItem('musicMuted', 'true');
        }
    });
    
    // Save audio state before page unload
    window.addEventListener('beforeunload', function() {
        if (!audio.paused) {
            localStorage.setItem('musicPosition', audio.currentTime.toString());
            localStorage.setItem('musicVolume', audio.volume.toString());
        }
    });
}