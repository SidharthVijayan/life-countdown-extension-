// 🔊 SOUND
function playSound(type) {
  const sound = document.getElementById(type + "Sound");
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

// 💾 SAVE + INSTANT REFRESH
function saveAll() {
  const dob = document.getElementById("dob").value;
  let lifespan = parseInt(document.getElementById("lifespan").value);
  const goal = parseInt(document.getElementById("goal").value);
  const income = parseInt(document.getElementById("income").value);

  if (!dob || !lifespan || !goal || !income) {
    alert("Fill all fields bro 😄");
    return;
  }

  if (lifespan > 70) lifespan = 70;

  chrome.storage.sync.set({ dob, lifespan, goal, income }, () => {
    document.getElementById("timer").innerText = "Updating...";
    
    calculateLife();
    calculateFinance();
    updateStreak();

    playSound("success");

    console.log("Saved + UI updated");
  });
}

// ⏳ LIFE TIMER
function calculateLife() {
  chrome.storage.sync.get(["dob", "lifespan"], (data) => {
    if (!data.dob) return;

    const dob = new Date(data.dob);
    const lifespan = data.lifespan || 70;

    const now = new Date();
    const end = new Date(dob);
    end.setFullYear(end.getFullYear() + lifespan);

    const total = end - dob;
    const used = now - dob;
    let remaining = end - now;

    const percent = (used / total) * 100;

    document.getElementById("lifeProgress").style.width = percent + "%";
    document.getElementById("percent").innerText =
      percent.toFixed(1) + "% life used";

    function tick() {
      remaining -= 1000;

      if (remaining <= 0) return;

      const hrs = Math.floor(remaining / (1000 * 60 * 60));
      const mins = Math.floor((remaining / (1000 * 60)) % 60);
      const secs = Math.floor((remaining / 1000) % 60);

      document.getElementById("timer").innerText =
        `${hrs}h ${mins}m ${secs}s`;

      setTimeout(tick, 1000);
    }

    tick();
  });
}

// 💰 FINANCE
function calculateFinance() {
  chrome.storage.sync.get(["goal", "income", "dob", "lifespan"], (data) => {
    if (!data.goal || !data.income || !data.dob) return;

    const dob = new Date(data.dob);
    const now = new Date();

    const yearsUsed = now.getFullYear() - dob.getFullYear();
    const yearsLeft = (data.lifespan || 70) - yearsUsed;

    const monthlyRequired = data.goal / (yearsLeft * 12);
    const gap = data.income / monthlyRequired;

    document.getElementById("financeOutput").innerText =
      `Need ₹${Math.round(monthlyRequired)}/month\nCurrent ₹${data.income}`;

    document.getElementById("gapFill").style.width =
      Math.min(gap * 100, 100) + "%";

    generateInsight(gap, yearsLeft);
    addGamification(gap);

    // 🔴 warning mode
    if (gap < 0.5) {
      document.body.classList.add("warning");
    } else {
      document.body.classList.remove("warning");
    }
  });
}

// 😄 HUMOR ENGINE
function generateInsight(gap, yearsLeft) {
  let messages = [];

  if (gap < 0.4) {
    messages = [
      "🚨 Bro… even your future self is sweating.",
      "💀 This plan is vibes, not strategy.",
      "😬 You’re not late… you’re prehistoric.",
      "📉 Your money plan just ghosted reality.",
      "🔥 Wake up before time runs out."
    ];
  } else if (gap < 0.7) {
    messages = [
      "⚠️ Not bad… but not impressive.",
      "😅 You’re doing okay… ish.",
      "📊 One push now = big payoff.",
      "🛠 Still fixable. Act now.",
      "⏳ You’re leaking time quietly."
    ];
  } else if (gap < 1) {
    messages = [
      "🙂 Close! Don’t choke now.",
      "💪 Almost there—stay sharp.",
      "🚀 You’re warming up.",
      "🎯 Lock in and finish strong.",
      "📈 Winners push here."
    ];
  } else {
    messages = [
      "🔥 You’re dangerous now.",
      "💰 Future you says thank you.",
      "👑 Wealth mode unlocked.",
      "🚀 Retire early at this pace.",
      "🎮 You’re winning."
    ];
  }

  const msg = messages[Math.floor(Math.random() * messages.length)];

  const daily = [
    "Today matters more than you think.",
    "Don’t waste a good day.",
    "Even 1 focused hour wins.",
    "No zero days.",
    "Future you is watching."
  ];

  const dailyMsg = daily[new Date().getDate() % daily.length];

  document.getElementById("insight").innerText =
    msg + "\n\n⏳ " + yearsLeft + " years left.\n\n" + dailyMsg;
}

// 🎮 LEVEL
function addGamification(gap) {
  let level = "";

  if (gap < 0.4) level = "🐣 Survival Mode";
  else if (gap < 0.7) level = "⚒ Getting Serious";
  else if (gap < 1) level = "🚀 Momentum";
  else level = "👑 Wealth Builder";

  document.getElementById("level").innerText = level;
}

// 🔥 STREAK
function updateStreak() {
  chrome.storage.sync.get(["lastVisit", "streak"], (data) => {
    const today = new Date().toDateString();

    let streak = data.streak || 0;

    if (data.lastVisit === today) {
      // no change
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (data.lastVisit === yesterday.toDateString()) {
        streak += 1;
      } else {
        streak = 1;
      }
    }

    chrome.storage.sync.set({
      lastVisit: today,
      streak: streak
    });

    document.getElementById("streak").innerText =
      `🔥 ${streak} day streak`;
  });
}

// 🚀 INIT
document.addEventListener("DOMContentLoaded", () => {
  playSound("click");
  calculateLife();
  calculateFinance();
  updateStreak();
});
