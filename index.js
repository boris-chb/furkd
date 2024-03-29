let [
  logoutBtn,
  productionBtn,
  wellnessBtn,
  breakBtn,
  downtimeBtn,
  lunchBtn,
  trainingBtn,
  rcaBtn,
  personalBtn,
] = document.querySelectorAll('.button3');

function $scheduleTimer(timer = minutesTillNext2AM(), btn = logoutBtn) {
  const milliseconds = timer * 60 * 1000; // Convert minutes to milliseconds

  console.log(btn.innerHTML, 'at', new Date(Date.now() + milliseconds));
  setTimeout(() => {
    btn.click();
  }, milliseconds);
}

function minutesTillNext2AM() {
  const now = new Date();
  const next2AM = new Date(now);

  // If it's already past 2 AM today, set the target to 2 AM tomorrow
  if (now.getHours() >= 2) {
    next2AM.setDate(now.getDate() + 1);
  }

  next2AM.setHours(2, 0, 0, 0);

  // Calculate the difference in milliseconds
  const diff = next2AM - now;

  // Convert milliseconds to minutes and round down
  return Math.floor(diff / (1000 * 60));
}

function minutesTillNext5PM() {
  const now = new Date();
  const next5PM = new Date(now);

  // If it's already past 5 PM today, set the target to 5 PM tomorrow
  if (now.getHours() >= 17) {
    next5PM.setDate(now.getDate() + 1);
  }

  next5PM.setHours(17, 0, 0, 0);

  // Calculate the difference in milliseconds
  const diff = next5PM - now;

  // Convert milliseconds to minutes and round down
  return Math.floor(diff / (1000 * 60));
}

function setOperatorTimer(minutes) {
  const btn = document.getElementsByClassName('attendance-checkin')[0];
  const timeTillEnd = 60 * 1000 * minutes;

  console.log('logout at', new Date(Date.now() + minutes * 60 * 1000));

  return setTimeout(() => {
    btn.click();
  }, timeTillEnd);
}

if (personalBtn) {
  personalBtn.onclick = () => $scheduleTimer();
}

if (trainingBtn) {
  trainingBtn.onclick = () => {
    $scheduleTimer(minutesTillNext5PM(), (btn = logoutBtn));
    $scheduleTimer(minutesTillNext5PM() + 0.1, (btn = productionBtn));
  };
}
