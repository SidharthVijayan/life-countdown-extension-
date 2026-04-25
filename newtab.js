// 🎯 PARSE DOB (supports DD/MM/YYYY + YYYY-MM-DD)
function parseDOB(input) {
  if (!input) return null;

  if (input.includes("/")) {
    const parts = input.split("/");
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
  }

  return new Date(input);
}

// 💾 SAVE
function saveAll() {
  const dobInput = document.getElementById("dob").value;
  let lifespan = parseInt(document.getElementById("lifespan").value);
  const goal = parseInt(document.getElementById("goal").value);
  const income = parseInt(document.getElementById("income").value);

  const dob = parseDOB(dobInput);

  if (!dob || isNaN(dob)) {
    alert("Invalid DOB 😄 Use DD/MM/YYYY");
    return;
  }

  if (!lifespan || !goal || !income) {
    alert("Fill all fields 😄");
    return;
  }

  if (lifespan > 70) lifespan = 70;

  chrome.storage.sync.set({
    dob: dob.toISOString(),
    lifespan,
    goal,
    income
  }, () => {
    location.reload();
  });
}

// ⏳ LIFE TIMER
function calculateLife() {
  chrome.storage.sync.get(["dob", "lifespan"], (data) => {
    if (!data.dob) return;

    const dob = new Date(data.dob);
    const now = new Date();

    const lifespan = data.lifespan || 70;

    const end = new Date(dob);
    end.setFullYear(end.getFullYear() + lifespan);

    let remaining = end - now;

    const total = end - dob;
    const used = now - dob;

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

    if (yearsLeft <= 0) return;

    const monthlyRequired = data.goal / (yearsLeft * 12);
    const gap = data.income / monthlyRequired;

    document.getElementById("financeOutput").innerText =
      `Need ₹${Math.round(monthlyRequired)}/month\nCurrent ₹${data.income}`;

    document.getElementById("gapFill").style.width =
      Math.min(gap * 100, 100) + "%";

    document.getElementById("level").innerText =
      gap < 0.5 ? "⚠ Survival Mode" : "🚀 On Track";

    document.getElementById("insight").innerText =
      `You have ${yearsLeft} years left.\nProgress: ${(gap * 100).toFixed(0)}%`;
  });
}

// 🔥 STREAK
function updateStreak() {
  chrome.storage.sync.get(["lastVisit", "streak"], (data) => {
    const today = new Date().toDateString();
    let streak = data.streak || 0;

    if (data.lastVisit !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (data.lastVisit === yesterday.toDateString()) {
        streak++;
      } else {
        streak = 1;
      }
    }

    chrome.storage.sync.set({ lastVisit: today, streak });

    document.getElementById("streak").innerText =
      `🔥 ${streak} day streak`;
  });
}

// 🚀 INIT
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("saveBtn").addEventListener("click", saveAll);

  calculateLife();
  calculateFinance();
  updateStreak();
});
