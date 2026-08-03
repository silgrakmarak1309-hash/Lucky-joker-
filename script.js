// State Management
let userData = JSON.parse(localStorage.getItem('luckyUser')) || {
  id: 'user_' + Math.floor(1000 + Math.random() * 9000),
  coins: 100,
  adsWatched: 0,
  referCode: 'LUCKY' + Math.floor(100 + Math.random() * 900)
};

let allUsers = JSON.parse(localStorage.getItem('adminUsers')) || [userData];
let withdrawRequests = JSON.parse(localStorage.getItem('withdrawRequests')) || [];
let admobConfig = JSON.parse(localStorage.getItem('admobConfig')) || {
  appId: '',
  rewardedId: ''
};

// Elements
const userCoinsEl = document.getElementById('userCoins');
const walletCoinsEl = document.getElementById('walletCoins');
const dailyAdsCountEl = document.getElementById('dailyAdsCount');
const rewardModal = document.getElementById('rewardModal');
const rewardCoinText = document.getElementById('rewardCoinText');

// Initial Load
function updateUI() {
  userCoinsEl.textContent = userData.coins;
  walletCoinsEl.textContent = userData.coins;
  dailyAdsCountEl.textContent = userData.adsWatched;
  localStorage.setItem('luckyUser', JSON.stringify(userData));
}
updateUI();

// Navigation Setup
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(btn.dataset.target).classList.add('active');
  });
});

// Admin View Toggle
document.getElementById('adminToggleBtn').addEventListener('click', () => {
  document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
  document.getElementById('adminView').classList.add('active');
  loadAdminData();
});

// AdMob Reward System Simulation/Hook
function showRewardedAd(callback) {
  // If native AdMob available
  if (window.admob && admob.rewarded) {
    admob.rewarded.show().then(callback);
  } else {
    // Fallback simulation for Web View
    alert("Ad Playing... (AdMob Ready)");
    setTimeout(callback, 1000);
  }
}

function giveReward(coins) {
  userData.coins += coins;
  userData.adsWatched += 1;
  updateUI();
  
  rewardCoinText.textContent = `+${coins}`;
  rewardModal.style.display = 'flex';
}

document.getElementById('closeModalBtn').addEventListener('click', () => {
  rewardModal.style.display = 'none';
});

// Watch Ad Button
document.getElementById('watchAdBtn').addEventListener('click', () => {
  showRewardedAd(() => giveReward(10));
});

// Spin Game
document.getElementById('spinBtn').addEventListener('click', () => {
  if (userData.adsWatched >= 30) {
    alert("Daily limit reached!");
    return;
  }
  showRewardedAd(() => {
    const wheel = document.getElementById('wheel');
    const randomDegree = 1800 + Math.floor(Math.random() * 360);
    wheel.style.transform = `rotate(${randomDegree}deg)`;
    
    setTimeout(() => {
      giveReward(15);
    }, 3000);
  });
});

// Flip Cards (1 Unlocked, 2 Locked)
document.querySelectorAll('.flip-card').forEach((card, idx) => {
  card.addEventListener('click', () => {
    if (card.classList.contains('flipped')) return;

    if (card.classList.contains('locked')) {
      if (confirm("Watch Ad to unlock this card?")) {
        showRewardedAd(() => {
          card.classList.remove('locked');
          card.classList.add('flipped');
          document.getElementById(`cardResult${idx}`).textContent = "+20";
          giveReward(20);
        });
      }
    } else {
      card.classList.add('flipped');
      document.getElementById(`cardResult${idx}`).textContent = "+10";
      giveReward(10);
    }
  });
});

// Withdraw System
document.getElementById('withdrawForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const method = document.getElementById('payoutMethod').value;
  const details = document.getElementById('payoutDetails').value;
  const coins = parseInt(document.getElementById('payoutCoins').value);

  if (coins > userData.coins) {
    alert("Insufficient Balance!");
    return;
  }

  userData.coins -= coins;
  updateUI();

  withdrawRequests.push({
    id: Date.now(),
    userId: userData.id,
    methodDetails: `${method}: ${details}`,
    coins: coins,
    status: 'Pending'
  });
  localStorage.setItem('withdrawRequests', JSON.stringify(withdrawRequests));

  alert("Withdrawal request submitted successfully!");
});

// Admin Panel Functions
function loadAdminData() {
  // Load Users
  const userTable = document.getElementById('adminUserTable');
  userTable.innerHTML = allUsers.map(u => `
    <tr>
      <td>${u.id}</td>
      <td>${u.coins}</td>
      <td>${u.referCode}</td>
      <td><button class="btn btn-secondary btn-sm" onclick="addCoinsAdmin('${u.id}')">+50</button></td>
    </tr>
  `).join('');

  // Load Withdrawals
  const withdrawTable = document.getElementById('adminWithdrawTable');
  withdrawTable.innerHTML = withdrawRequests.map(w => `
    <tr>
      <td>${w.userId}</td>
      <td>${w.methodDetails}</td>
      <td>${w.coins}</td>
      <td><strong>${w.status}</strong></td>
      <td>
        ${w.status === 'Pending' ? `
          <button class="btn btn-primary btn-sm" onclick="updateWithdraw(${w.id}, 'Approved')">Approve</button>
        ` : 'Done'}
      </td>
    </tr>
  `).join('');
}

window.updateWithdraw = function(id, status) {
  withdrawRequests = withdrawRequests.map(w => w.id === id ? {...w, status} : w);
  localStorage.setItem('withdrawRequests', JSON.stringify(withdrawRequests));
  loadAdminData();
};

window.addCoinsAdmin = function(userId) {
  userData.coins += 50;
  updateUI();
  loadAdminData();
};

// Save AdMob Settings
document.getElementById('saveAdmobBtn').addEventListener('click', () => {
  admobConfig.appId = document.getElementById('admAppId').value;
  admobConfig.rewardedId = document.getElementById('admRewardedId').value;
  localStorage.setItem('admobConfig', JSON.stringify(admobConfig));
  alert("AdMob Settings Saved!");
});
