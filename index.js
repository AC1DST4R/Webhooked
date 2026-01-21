const queue = [];

const previewMessage = document.getElementById("previewMessage");
const previewName = document.getElementById("previewName");
const previewAvatar = document.getElementById("previewAvatar");
const previewEmbed = document.getElementById("previewEmbed");

function parseMentions(text) {
    return text
        .replace(/<@(\d+)>/g, `<span class="mention">@user</span>`)
        .replace(/<#(\d+)>/g, `<span class="mention">#channel</span>`);
}

document.getElementById("message").addEventListener("input", e => {
    previewMessage.innerHTML = parseMentions(e.target.value);
});

document.getElementById("username").addEventListener("input", e => {
    previewName.textContent = e.target.value || "Webhook'd";
});

document.getElementById("avatar").addEventListener("input", e => {
    previewAvatar.src = e.target.value;
});

document.getElementById("embedTitle").addEventListener("input", updateEmbed);
document.getElementById("embedDesc").addEventListener("input", updateEmbed);
document.getElementById("embedColor").addEventListener("input", updateEmbed);

function updateEmbed() {
    const title = embedTitle.value;
    const desc = embedDesc.value;
    const color = embedColor.value || "#2ea043";

    previewEmbed.style.borderLeftColor = color;
    previewEmbed.innerHTML = title || desc
        ? `<strong>${title}</strong><div>${desc}</div>`
        : "";
}

document.getElementById("queueBtn").addEventListener("click", () => {
    const timeInput = document.getElementById("sendTime").value;
    let sendAt = timeInput ? new Date(timeInput) : null;

    if (sendAt && sendAt - Date.now() > 259200000) {
        alert("Max delay is 3 days.");
        return;
    }

    const item = {
        webhook: webhookUrl.value,
        payload: {
            content: message.value,
            username: username.value || undefined,
            avatar_url: avatar.value || undefined,
            embeds: embedTitle.value || embedDesc.value ? [{
                title: embedTitle.value,
                description: embedDesc.value,
                color: parseInt(embedColor.value.replace("#",""),16)
            }] : []
        },
        sendAt
    };

    queue.push(item);
    renderQueue();
    schedule(item);
});

function renderQueue() {
    const q = document.getElementById("queue");
    q.innerHTML = "";
    queue.forEach((m,i)=>{
        q.innerHTML += `<div class="queue-item">
            ${m.sendAt ? "Scheduled" : "Instant"} message
        </div>`;
    });
}

function schedule(item) {
    const delay = item.sendAt ? item.sendAt - Date.now() : 0;
    setTimeout(()=>send(item), delay);
}

async function send(item) {
    await fetch(item.webhook, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(item.payload)
    });
}
