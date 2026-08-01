const plan = [
  {
    day: "周一",
    title: "标准跳绳日",
    items: ["热身 5 分钟", "跳绳 1 分钟 × 7 组，目标最好一组 180+", "拉伸 5 分钟：大腿后侧、小腿、髋部", "饭后散步 20 分钟"],
    note: "跳绳目标要留余量，不按刚好达标练。今天只做基础量，把消耗稳定做出来。"
  },
  {
    day: "周二",
    title: "跳绳 + 核心",
    items: ["跳绳 12 分钟，中间插 3 次快跳", "仰卧起坐 4 组，每组 12-15 个，目标向 49+ 靠近", "拉伸 5 分钟：坐位体前屈方向", "饭后散步 15 分钟"],
    note: "仰卧按满分线练，因为考试动作不规范会被扣。训练目标要比现场标准更宽。"
  },
  {
    day: "周三",
    title: "轻松减重日",
    items: ["跳绳 10 分钟，轻松不断即可", "骑车、游泳、球类或快走 25 分钟", "拉伸 8 分钟：坐位体前屈方向", "晚饭七分饱"],
    note: "这是最重要的减重日之一。强度低一点没关系，活动时间要够。"
  },
  {
    day: "周四",
    title: "跳绳 + 跑步手感",
    items: ["跳绳 1 分钟 × 6 组，目标最好一组 180+", "高抬腿 2 组 + 20 米加速跑 4 次", "拉伸 5 分钟", "50 米计时 1 次，可选"],
    note: "50 米只保持手感。体重轻了，跑步自然会快，不需要天天硬跑。"
  },
  {
    day: "周五",
    title: "跳绳 + 自重力量",
    items: ["跳绳 12 分钟，最后 1 分钟冲 180+", "深蹲 3 组，每组 12 个", "仰卧起坐 3 组，每组 12-15 个", "拉伸 5 分钟"],
    note: "力量训练只做简单动作，让膝踝更稳。真正的主菜仍然是跳绳和走路。"
  },
  {
    day: "周六",
    title: "周测日",
    items: ["测体重，记录 BMI", "1 分钟跳绳测 2 次，取最好成绩，目标 180+", "仰卧起坐测 1 次，目标 49+", "拉伸 8 分钟"],
    note: "周六看趋势：体重有没有往下，跳绳和仰卧有没有留出考试余量。"
  },
  {
    day: "周日",
    title: "恢复日",
    items: ["跳绳 5 分钟，只找手感", "散步或户外玩 30 分钟", "拉伸 8 分钟：坐位体前屈方向", "早点睡"],
    note: "恢复日不追成绩。睡眠、少糖、每天动，是减重能坚持下来的关键。"
  }
];

const storageKey = "fitness-summer-plan-v1";
const todayISO = () => new Date().toISOString().slice(0, 10);
const el = (id) => document.getElementById(id);

const state = JSON.parse(localStorage.getItem(storageKey) || "{}");
state.startDate ||= "2026-07-06";
state.reminderTime ||= "19:30";
state.days ||= {};
state.metrics ||= [];

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function setReminderStatus(message, kind = "") {
  const box = el("reminderStatus");
  if (!box) return;
  box.textContent = message;
  box.className = `control-hint ${kind}`.trim();
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

  const checks = el("checkItems");
  checks.innerHTML = "";

  workout.items.forEach((item, index) => {
    const node = document.getElementById("workoutTemplate").content.cloneNode(true);
    const input = node.querySelector("input");
    const text = node.querySelector("span");
    input.checked = Boolean(dayState.checks[index]);
    input.dataset.index = String(index);
    text.textContent = item;
    checks.appendChild(node);
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

function switchTab(panelId) {
  document.querySelectorAll(".plan-tab").forEach((tab) => {
    const selected = tab.dataset.tab === panelId;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    const selected = panel.id === panelId;
    panel.classList.toggle("active", selected);
    panel.hidden = !selected;
  });
  localStorage.setItem("fitness-active-tab", panelId);
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
    setReminderStatus("当前浏览器不支持网页提醒。华为手机建议直接用“生成日历提醒”导入系统日历。", "warn");
    return;
  }

  if (window.isSecureContext === false && location.protocol !== "https:") {
    setReminderStatus("当前是本地页面打开，网页提醒权限在手机上常常不可用。建议直接用“生成日历提醒”。", "warn");
    return;
  }

  Notification.requestPermission()
    .then((permission) => {
      if (permission === "granted") {
        new Notification("Max · 二六年暑期体测满分计划", {
          body: `提醒已开启。每天 ${state.reminderTime} 打开页面时会提示今日训练。`
        });
        setReminderStatus(`浏览器提醒已开启，每天 ${state.reminderTime} 会提示今日训练。`, "ok");
        scheduleBrowserReminder();
        return;
      }
      setReminderStatus("没有获得浏览器提醒权限。可以改用“生成日历提醒”。", "warn");
    })
    .catch(() => {
      setReminderStatus("这个手机浏览器的提醒权限被拦截了。建议改用“生成日历提醒”。", "warn");
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
  const ics = lines.join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const fileName = "Max_二六年暑期体测满分计划.ics";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;

  try {
    document.body.appendChild(a);
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setReminderStatus(`日历文件已生成。如果手机没有自动下载，请长按页面或改用系统自带日历导入。`, "ok");
  } catch (error) {
    const fallback = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
    window.open(fallback, "_blank", "noopener,noreferrer");
    URL.revokeObjectURL(url);
    setReminderStatus("手机浏览器不支持直接下载，已尝试打开日历文件。你也可以复制后导入系统日历。", "warn");
  } finally {
    a.remove();
  }
}

document.addEventListener("change", (event) => {
  if (event.target.matches("#checkItems input")) {
    syncCheck(event.target);
  }
});

el("saveDay").addEventListener("click", saveToday);
el("enableNotify").addEventListener("click", enableNotifications);
el("downloadCalendar").addEventListener("click", downloadCalendar);

document.querySelectorAll(".plan-tab").forEach((tab) => {
  tab.addEventListener("click", () => switchTab(tab.dataset.tab));
});

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
switchTab(localStorage.getItem("fitness-active-tab") || "trainingPanel");
scheduleBrowserReminder();
