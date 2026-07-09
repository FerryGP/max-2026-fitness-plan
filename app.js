const plan = [
  {
    day: "周一",
    title: "标准跳绳日",
    items: ["热身 5 分钟：慢跑或原地活动", "跳绳 1 分钟 × 6 组，组间休息 1 分钟", "饭后散步 20 分钟", "不喝含糖饮料"],
    note: "今天只做基础量。目标不是累趴，是把每天消耗稳定做出来。"
  },
  {
    day: "周二",
    title: "跳绳 + 核心",
    items: ["跳绳 12 分钟：轻松跳为主，中间插 3 次快跳", "仰卧起坐 3 组，每组 12-15 个", "平板支撑 2 组，每组 30 秒", "饭后散步 15 分钟"],
    note: "核心只做一点点辅助。跳绳和体重下降，才是让仰卧起坐更轻松的主因。"
  },
  {
    day: "周三",
    title: "轻松减重日",
    items: ["跳绳 8-10 分钟，轻松不断即可", "骑车、游泳、球类或快走 25 分钟", "拉伸 5 分钟", "晚饭七分饱"],
    note: "这是最重要的减重日之一。强度低一点没关系，活动时间要够。"
  },
  {
    day: "周四",
    title: "跳绳 + 跑步手感",
    items: ["跳绳 1 分钟 × 5 组", "高抬腿 2 组 + 20 米加速跑 4 次", "50 米计时 1 次，可选", "跑后慢走 10 分钟"],
    note: "50 米只保持手感。体重轻了，跑步自然会快，不需要天天硬跑。"
  },
  {
    day: "周五",
    title: "跳绳 + 自重力量",
    items: ["跳绳 12 分钟", "深蹲 3 组，每组 12 个", "提踵 2 组，每组 15 个", "饭后散步 20 分钟"],
    note: "力量训练只做简单动作，让膝踝更稳。真正的主菜仍然是跳绳和走路。"
  },
  {
    day: "周六",
    title: "周测日",
    items: ["测体重，记录 BMI", "1 分钟跳绳测 1 次，记录最好成绩", "仰卧起坐测 1 次", "户外活动 30 分钟"],
    note: "周六只看趋势：体重有没有往下，跳绳能不能稳住。不要因为一次波动影响心情。"
  },
  {
    day: "周日",
    title: "恢复日",
    items: ["跳绳 5 分钟，只找手感", "散步或户外玩 30 分钟", "拉伸 5 分钟", "早点睡"],
    note: "恢复日不追成绩。睡眠、少糖、每天动，是减重能坚持下来的关键。"
  }
];

const storageKey = "fitness-summer-plan-v1";
const baselineVersion = "20260709-rope167-run60";
const baselineMetric = {
  date: "2026-07-09",
  sprint50: "11.10",
  lung: "2680",
  flex: "18",
  rope: "167",
  situps: "42",
  height: "140",
  weight: "45",
  totalScore: "100",
  middleExamScore: "10/10"
};
const todayISO = () => new Date().toISOString().slice(0, 10);
const el = (id) => document.getElementById(id);

const state = JSON.parse(localStorage.getItem(storageKey) || "{}");
state.startDate ||= "2026-07-06";
state.reminderTime ||= "19:30";
state.days ||= {};
state.metrics ||= [];
if (state.baselineVersion !== baselineVersion) {
  state.metrics = state.metrics.filter((row) => row.date !== baselineMetric.date);
  state.metrics.push(baselineMetric);
  state.baselineVersion = baselineVersion;
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function dateDiffDays(a, b) {
  const ms = 24 * 60 * 60 * 1000;
  return Math.floor((new Date(a + "T00:00:00") - new Date(b + "T00:00:00")) / ms);
}

function currentDayIndex() {
  return Math.max(0, dateDiffDays(todayISO(), state.startDate));
}

function calcBmi(heightCm, weightKg) {
  const heightM = Number(heightCm) / 100;
  const weight = Number(weightKg);
  if (!heightM || !weight) return "";
  return (weight / (heightM * heightM)).toFixed(1);
}

function planForDate(date) {
  const diff = Math.max(0, dateDiffDays(date, state.startDate));
  return plan[diff % 7];
}

function renderToday() {
  const date = todayISO();
  const workout = planForDate(date);
  const week = Math.min(8, Math.floor(currentDayIndex() / 7) + 1);
  const dayState = state.days[date] || { checks: {}, memo: "" };

  el("todayTitle").textContent = `${workout.day} · ${workout.title}`;
  el("weekBadge").textContent = `第 ${week} 周`;
  el("coachNote").textContent = workout.note;
  el("dailyMemo").value = dayState.memo || "";

  const list = el("todayWorkout");
  const checks = el("checkItems");
  list.innerHTML = "";
  checks.innerHTML = "";

  workout.items.forEach((item, index) => {
    const node = document.getElementById("workoutTemplate").content.cloneNode(true);
    const input = node.querySelector("input");
    const text = node.querySelector("span");
    input.checked = Boolean(dayState.checks[index]);
    input.dataset.index = String(index);
    text.textContent = item;
    list.appendChild(node);

    const checkNode = document.getElementById("workoutTemplate").content.cloneNode(true);
    const checkInput = checkNode.querySelector("input");
    const checkText = checkNode.querySelector("span");
    checkInput.checked = Boolean(dayState.checks[index]);
    checkInput.dataset.index = String(index);
    checkText.textContent = item;
    checks.appendChild(checkNode);
  });

  const completeCount = Object.values(dayState.checks || {}).filter(Boolean).length;
  const done = completeCount === workout.items.length;
  el("todayStatus").textContent = done ? "已完成" : `已完成 ${completeCount}/${workout.items.length}`;
  el("todayStatus").classList.toggle("done", done);
}

function renderWeeklyPlan() {
  const wrap = el("weeklyPlan");
  const today = planForDate(todayISO()).day;
  wrap.innerHTML = plan.map((day) => `
    <div class="day-card ${day.day === today ? "today" : ""}">
      <strong>${day.day} · ${day.title}</strong>
      <p>${day.items.join("；")}</p>
    </div>
  `).join("");
}

function renderProgress() {
  const doneDays = Object.values(state.days).filter((day) => {
    return day.done || Object.values(day.checks || {}).some(Boolean);
  }).length;
  const percent = Math.min(100, Math.round((doneDays / 56) * 100));
  el("progressBar").style.width = `${percent}%`;
  el("progressText").textContent = `${doneDays}/56 天`;
}

function renderMetrics() {
  const history = el("metricHistory");
  const rows = [...state.metrics].sort((a, b) => b.date.localeCompare(a.date));
  history.innerHTML = rows.length ? rows.map((row) => `
    <div class="history-item">
      <strong>${row.date}</strong>
      <span>估分 ${row.totalScore || "-"}</span>
      <span>中考 ${row.middleExamScore || "-"}</span>
      <span>肺活量 ${row.lung || "-"}ml</span>
      <span>50米 ${row.sprint50 || "-"}s</span>
      <span>坐位 ${row.flex || "-"}cm</span>
      <span>跳绳 ${row.rope || "-"}个</span>
      <span>仰卧 ${row.situps || "-"}个</span>
      <span>身高 ${row.height || "-"}cm</span>
      <span>体重 ${row.weight || "-"}kg</span>
      <span>BMI ${calcBmi(row.height, row.weight) || "-"}</span>
    </div>
  `).join("") : `<p class="empty">还没有记录。周六测一次，慢慢看趋势。</p>`;
}

function renderAll() {
  el("startDate").value = state.startDate;
  el("reminderTime").value = state.reminderTime;
  el("metricDate").value = todayISO();
  renderToday();
  renderWeeklyPlan();
  renderProgress();
  renderMetrics();
}

function saveToday() {
  const date = todayISO();
  const checks = {};
  document.querySelectorAll("#checkItems input[type='checkbox']").forEach((input) => {
    checks[input.dataset.index] = input.checked;
  });
  const workout = planForDate(date);
  const completeCount = Object.values(checks).filter(Boolean).length;
  state.days[date] = {
    checks,
    memo: el("dailyMemo").value.trim(),
    done: completeCount === workout.items.length
  };
  saveState();
  renderAll();
}

function syncCheck(source) {
  const index = source.dataset.index;
  document.querySelectorAll(`input[data-index='${index}']`).forEach((input) => {
    input.checked = source.checked;
  });
}

function enableNotifications() {
  if (!("Notification" in window)) {
    alert("这个浏览器不支持通知。可以用“生成日历提醒”导入系统日历。");
    return;
  }

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      new Notification("Max · 二六年暑期体测满分计划", {
        body: `提醒已开启。每天 ${state.reminderTime} 打开页面时会提示今日训练。`
      });
      scheduleBrowserReminder();
    } else {
      alert("没有获得通知权限。可以改用日历提醒。");
    }
  });
}

let reminderTimer = null;
function scheduleBrowserReminder() {
  if (reminderTimer) window.clearTimeout(reminderTimer);
  const [hours, minutes] = state.reminderTime.split(":").map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  reminderTimer = window.setTimeout(() => {
    const workout = planForDate(todayISO());
    if (Notification.permission === "granted") {
      new Notification(`今天：${workout.title}`, { body: workout.items[0] });
    }
    scheduleBrowserReminder();
  }, next - now);
}

function downloadCalendar() {
  const [hours, minutes] = state.reminderTime.split(":");
  const start = new Date(state.startDate + `T${hours}:${minutes}:00`);
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Summer Fitness Plan//CN"
  ];

  for (let i = 0; i < 56; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const end = new Date(date);
    end.setMinutes(end.getMinutes() + 35);
    const p = plan[i % 7];
    const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    lines.push(
      "BEGIN:VEVENT",
      `UID:fitness-${i}-${state.startDate}@local`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${fmt(date)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:体测训练：${p.title}`,
      `DESCRIPTION:${p.items.join("；")}`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Max_二六年暑期体测满分计划.ics";
  a.click();
  URL.revokeObjectURL(url);
}

document.addEventListener("change", (event) => {
  if (event.target.matches("#todayWorkout input, #checkItems input")) {
    syncCheck(event.target);
  }
});

el("saveDay").addEventListener("click", saveToday);
el("enableNotify").addEventListener("click", enableNotifications);
el("downloadCalendar").addEventListener("click", downloadCalendar);

el("startDate").addEventListener("change", (event) => {
  state.startDate = event.target.value;
  saveState();
  renderAll();
});

el("reminderTime").addEventListener("change", (event) => {
  state.reminderTime = event.target.value;
  saveState();
  scheduleBrowserReminder();
});

el("resetToday").addEventListener("click", () => {
  delete state.days[todayISO()];
  saveState();
  renderAll();
});

el("metricForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const row = {
    date: el("metricDate").value || todayISO(),
    lung: el("lung").value,
    sprint50: el("sprint50").value,
    flex: el("flex").value,
    rope: el("rope").value,
    situps: el("situps").value,
    height: el("height").value,
    weight: el("weight").value
  };
  state.metrics = state.metrics.filter((item) => item.date !== row.date);
  state.metrics.push(row);
  saveState();
  event.target.reset();
  el("metricDate").value = todayISO();
  renderMetrics();
});

renderAll();
scheduleBrowserReminder();
