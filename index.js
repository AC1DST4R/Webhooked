const messageInput = document.getElementById("message");
const usernameInput = document.getElementById("username");
const avatarInput = document.getElementById("avatar");

const previewMessage = document.getElementById("previewMessage");
const previewName = document.getElementById("previewName");
const previewAvatar = document.getElementById("previewAvatar");

function renderMessage(text) {
    return text
        .replace(/<@(\d+)>/g, `<span class="mention">@user</span>`)
        .replace(/<#(\d+)>/g, `<span class="mention">#channel</span>`);
}

messageInput.addEventListener("input", () => {
    previewMessage.innerHTML = renderMessage(messageInput.value);
});

usernameInput.addEventListener("input", () => {
    previewName.textContent = usernameInput.value || "Webhook Bot";
});

avatarInput.addEventListener("input", () => {
    previewAvatar.src = avatarInput.value || "";
});

document.getElementById("sendBtn").addEventListener("click", async () => {
    const webhookUrl = document.getElementById("webhookUrl").value;
    const status = document.getElementById("status");

    const payload = {
        content: messageInput.value,
        username: usernameInput.value || undefined,
        avatar_url: avatarInput.value || undefined
    };

    try {
        const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        status.textContent = res.status === 204 ? "Sent ✅" : "Failed ❌";
    } catch {
        status.textContent = "Error ❌";
    }
});
