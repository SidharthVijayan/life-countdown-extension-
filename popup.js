function calculateLife() {
  chrome.storage.sync.get(["dob", "lifespan"], (data) => {
    if (!data.dob) {
      document.getElementById("timer").innerText = "Set data in new tab";
      return;
    }

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
      percent.toFixed(1) + "% used";

    function tick() {
      remaining -= 1000;

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

calculateLife();
