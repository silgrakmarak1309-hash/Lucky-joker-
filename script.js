let coins = 0;
let adsWatched = 0;
let currentUser = "";
let isGameLocked = false;
const ADMIN_EMAIL = "grejamarak@gmail.com";

// Simulation of App States
function simLogin() {
    const email = document.getElementById('login-email').value;
    if(!email.includes('@')) return alert("Enter valid email");
    currentUser = email;
    document.getElementById('page-login').style.display = 'none';
    document.getElementById('app-content').style.display = 'block';
    document.getElementById('user-email').innerText = email;
    document.getElementById('display-name').innerText = email.split('@')[0];
    
    if(email === ADMIN_EMAIL) document.getElementById('admin-tag').style.display = 'block';
    switchPage('page-home');
}

function switchPage(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// Sequential Ad Logic
function runAdSequence(count, callback) {
    let currentAd = 0;
    
    function showNextAd() {
        if (currentAd < count) {
            currentAd++;
            const overlay = document.getElementById('ad-overlay');
            const timerText = document.getElementById('ad-timer');
            const statusText = document.getElementById('ad-status');
            
            overlay.style.display = 'flex';
            statusText.innerText = `Watching Ad ${currentAd} of ${count}`;
            
            let timeLeft = 5;
            timerText.innerText = `Please wait ${timeLeft}s`;
            
            const timer = setInterval(() => {
                timeLeft--;
                timerText.innerText = `Please wait ${timeLeft}s`;
                if(timeLeft <= 0) {
                    clearInterval(timer);
                    overlay.style.display = 'none';
                    adsWatched++;
                    updateUI();
                    showNextAd(); // Recursive call for next ad
                }
            }, 1000);
        } else {
            callback(); // All ads finished
        }
    }
    showNextAd();
}

// Game Logic
function handleFlip(card, index) {
    if(isGameLocked || card.classList.contains('flipped')) return;
    isGameLocked = true;

    // Lock other 2 cards immediately
    document.querySelectorAll('.card').forEach((c, i) => {
        if(i !== index) c.classList.add('locked');
    });

    runAdSequence(1, () => {
        // Result calculation: 1 Win, 2 Lose
        let results = [0, 0, Math.floor(Math.random() * 12) + 1];
        results = results.sort(() => Math.random() - 0.5);
        
        const allCards = document.querySelectorAll('.card');
        allCards.forEach((c, i) => {
            c.querySelector('.back').innerText = results[i];
            c.classList.add('flipped');
        });

        coins += results[index];
        updateUI();
        document.getElementById('next-round').style.display = 'block';
    });
}

function resetGame() {
    isGameLocked = false;
    document.getElementById('next-round').style.display = 'none';
    document.querySelectorAll('.card').forEach(c => {
        c.classList.remove('flipped', 'locked');
    });
}

// Daily Bonus Sequence (2 Ads)
function claimDailySequence() {
    const btn = document.getElementById('daily-btn');
    runAdSequence(2, () => {
        const bonus = Math.floor(Math.random() * 41) + 10;
        coins += bonus;
        btn.disabled = true;
        btn.innerText = "Claimed ✅";
        alert(`You got ${bonus} coins!`);
        updateUI();
    });
}

function updateUI() {
    document.getElementById('coin-count').innerText = coins;
    document.getElementById('rs-bal').innerText = (coins / 20).toFixed(2);
    document.getElementById('stat-ads').innerText = adsWatched;
}

function changeAvatar(gender) {
    const img = gender === 'male' ? 
        "https://cdn-icons-png.flaticon.com/512/4140/4140048.png" : 
        "https://cdn-icons-png.flaticon.com/512/4140/4140047.png";
    document.getElementById('main-avatar').src = img;
    document.getElementById('big-avatar').src = img;
}

// AdMob Simulation for Interstitial
function showInterstitial() {
    // In real AdMob, you'd call the SDK here
    runAdSequence(1, () => { console.log("Interstitial finished"); });
}