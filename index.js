const queue = [];
let embedEnabled = false;

/* Elements */
const msg = document.getElementById("message");
const previewMsg = document.getElementById("previewMessage");
const previewName = document.getElementById("previewName");
const previewAvatar = document.getElementById("previewAvatar");
const previewEmbed = document.getElementById("previewEmbed");
const queueDiv = document.getElementById("queue");

/* Mentions */
function parseMentions(text) {
    return text
        .replace(/<@(\d+)>/g, '<span class="mention">@user</span>')
        .replace(/<#(\d+)>/g, '<span class="mention">#channel</span>');
}

/* Live Preview */
msg.oninput = () => previewMsg.innerHTML = parseMentions(msg.value);
document.getElementById("username").oninput = e =>
    previewName.textContent = e.target.value || "Webhook";
document.getElementById("avatar").oninput = e =>
    previewAvatar.src = e.target.value;

/* Embed Logic */
addEmbedBtn.onclick = () => {
    embedEnabled = true;
    embedEditor.classList.remove("hidden");
    previewEmbed.classList.remove("hidden");
};

removeEmbed.onclick = () => {
    embedEnabled = false;
    embedEditor.classList.add("hidden");
    previewEmbed.classList.add("hidden");
    previewEmbed.innerHTML = "";
};

function updateEmbed() {
    if (!embedEnabled) return;
    previewEmbed.innerHTML = `
        ${embedTitle.value ? `<strong>${embedTitle.value}</strong>` : ""}
        ${embedDesc.value ? `<div>${embedDesc.value}</div>` : ""}
        ${embedImage.value ? `<img src="${embedImage.value}" style="max-width:100%;margin-top:6px;">` : ""}
    `;
}

embedTitle.oninput = updateEmbed;
embedDesc.oninput = updateEmbed;
embedImage.oninput = updateEmbed;

/* Clear All */
clearBtn.onclick = () => {
    if (!skipConfirm.checked && !confirm("Clear all text?")) return;

    webhookUrl.value = "";
    username.value = "";
    avatar.value = "";
    msg.value = "";
    embedTitle.value = embedDesc.value = embedImage.value = "";
    previewMsg.innerHTML = "";
    previewEmbed.innerHTML = "";
};

/* Queue + Send */
queueBtn.onclick = () => {
    if (!webhookUrl.value) return alert("Webhook URL required");

    const sendAt = sendTime.value ? new Date(sendTime.value) : null;
    if (sendAt && sendAt - Date.now() > 259200000)
        return alert("Max delay is 3 days");

    const payload = {
        content: msg.value,
        username: username.value || undefined,
        avatar_url: avatar.value || undefined,
        embeds: embedEnabled ? [{
            title: embedTitle.value,
            description: embedDesc.value,
            image: embedImage.value ? { url: embedImage.value } : undefined
        }] : []
    };

    const item = { webhook: webhookUrl.value, payload, sendAt, status: "Queued" };
    queue.push(item);
    renderQueue();
    schedule(item);
};

/* Render Queue */
function renderQueue() {
    queueDiv.innerHTML = "";
    queue.forEach((item, i) => {
        queueDiv.innerHTML += `
            <div class="queue-item">
                <strong>#${i + 1}</strong><br>
                ${item.sendAt ? "Scheduled: " + item.sendAt.toLocaleString() : "Instant send"}
                <br>Status: ${item.status}
            </div>
        `;
    });
}

/* Schedule */
function schedule(item) {
    const delay = item.sendAt ? item.sendAt - Date.now() : 0;
    setTimeout(() => send(item), Math.max(delay, 0));
}

/* Send */
async function send(item) {
    try {
        item.status = "Sending...";
        renderQueue();

        const res = await fetch(item.webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.payload)
        });

        item.status = res.status === 204 ? "Sent ✅" : "Failed ❌";
    } catch {
        item.status = "Error ❌";
    }
    renderQueue();
}

/* Init */
previewMsg.innerHTML = parseMentions(msg.value);

