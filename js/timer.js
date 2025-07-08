// === LOGIKA TIMER ===

function setupTimerListeners() {
    document.querySelectorAll('.timer-set-btn').forEach(button => {
        button.addEventListener('click', () => {
            const seconds = parseInt(button.dataset.time, 10);
            setAndResetTimer(seconds);
        });
    });

    document.getElementById('custom-time-btn').addEventListener('click', () => {
        const customTimeInput = document.getElementById('custom-time-input');
        const minutes = parseInt(customTimeInput.value, 10);
        if(minutes > 0){
            setAndResetTimer(minutes * 60);
        }
    });
    
    document.getElementById('timer-toggle-btn').addEventListener('click', () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            document.getElementById('timer-toggle-btn').textContent = 'Lanjut';
        } else {
            startTimer();
        }
    });

    document.getElementById('timer-reset-btn').addEventListener('click', () => {
        setAndResetTimer(totalTime);
    });

    document.getElementById('timer-fullscreen-btn').addEventListener('click', () => {
        const timerPanel = document.getElementById('panel-timer');
        if (!document.fullscreenElement) {
            timerPanel.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    });
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById('timer-display');
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    if(timeRemaining <= 10 && timeRemaining > 0) {
        timerDisplay.classList.add('ending');
    } else {
        timerDisplay.classList.remove('ending');
    }
}

function setAndResetTimer(duration) {
     clearInterval(timerInterval);
     timerInterval = null;
     timeRemaining = duration;
     totalTime = duration;
     updateTimerDisplay();
     document.getElementById('timer-toggle-btn').textContent = 'Mulai';
}

function startTimer() {
    if(timeRemaining <= 0) return;
    document.getElementById('timer-toggle-btn').textContent = 'Jeda';
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            document.getElementById('timer-toggle-btn').textContent = 'Selesai';
            playSound(soundSettings.badge);
            confetti({ particleCount: 200, spread: 120, origin: { y: 0.8 }});
        }
    }, 1000);
}