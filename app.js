const plan = [
  {
    day: "周一",
    title: "短跑技术 + 轻有氧",
    items: ["热身 10 分钟：慢跑 + 活动脚踝膝盖髋部", "高抬腿、小步跑、后蹬跑各 3 组", "30 米加速跑 4 组，组间走回恢复", "50 米计时 2 组，只追求动作稳", "饭后散步 15-20 分钟"],
    note: "今天练速度，也补一点日常活动量。50 米先把 10.10s 稳定推进到 9.70s。"
  },
  {
    day: "周二",
    title: "跳绳 + 核心",
    items: ["1 分钟跳绳 3 组，目标 155-165 个", "30 秒快速跳 3 组", "仰卧起坐 4 组：12/12/10/8，动作标准", "平板支撑 3 组，每组 25-40 秒"],
    note: "跳绳已经是优势项目，别天天冲极限；仰卧起坐先从 39 稳到 40+。"
  },
  {
    day: "周三",
    title: "BMI 管理有氧",
    items: ["慢跑、骑车、游泳或球类 30-35 分钟", "全程轻松，不冲刺，能完整说话", "拉伸小腿、大腿后侧、髋部 8 分钟", "今天不喝含糖饮料"],
    note: "身高 140cm、体重 45kg 时 BMI 约 23.0。先靠稳定活动量和饮食习惯，把它拉回 22.6 以内。"
  },
  {
    day: "周四",
    title: "50 米专项",
    items: ["起跑反应 6 次：听口令启动", "20 米冲刺 4 组", "50 米跑 2-3 组，记录最快一次", "10 米折返跑 4 组，为五年级做准备", "跑后慢走 8 分钟放松"],
    note: "最重要的一天。质量比数量重要，跑姿散了就停，目标是动作顺、步频快。"
  },
  {
    day: "周五",
    title: "综合力量",
    items: ["徒手深蹲 3 组，每组 10-12 个", "弓步走 2 组，每组 8-10 步", "提踵 3 组，每组 15 个", "臀桥 3 组，每组 12 个", "仰卧起坐 1 分钟小测 1 次"],
    note: "力量训练不要负重。下肢力量帮 50 米，核心稳定帮仰卧起坐和跑姿。"
  },
  {
    day: "周六",
    title: "模拟小测",
    items: ["50 米计时 1-2 次", "1 分钟跳绳 1 次", "1 分钟仰卧起坐 1 次", "测身高和体重，自动算 BMI", "写一句本周感受"],
    note: "今天是看趋势，不是审判日。BMI 看周趋势，50 米看最好成绩和动作质量。"
  },
  {
    day: "周日",
    title: "休息恢复",
    items: ["散步 30 分钟或户外轻松玩", "拉伸 8 分钟", "不喝含糖饮料，早点睡"],
    note: "恢复也是训练的一部分。休息好，下周才跑得动。"
  }
];

const storageKey = "fitness-summer-plan-v1";
const baselineMetric = {
  date: "2026-07-09",
  sprint50: "10.10",
  rope: "160",
  situps: "39",
  height: "140",
  weight: "45"
};
const todayISO = () => new Date().toISOString().slice(0, 10);
const el = (id) => document.getElementById(id);

const state = JSON.parse(localStorage.getItem(storageKey) || "{}");
state.startDate ||= "2026-07-06";
state.reminderTime ||= "19:30";
state.days ||= {};
state.metrics ||= [];
if (!state.metrics.some((row) => row.date === baselineMetric.date)) {
  state.metrics.push(baselineMetric);
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
      <span>50米 ${row.sprint50 || "-"}s</span>
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
    sprint50: el("sprint50").value,
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
