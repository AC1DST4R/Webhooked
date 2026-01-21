document.getElementById("sendBtn").addEventListener("click", async () => {
const webhookUrl = document.getElementById("webhookUrl").value;
const message = document.getElementById("message").value;
const status = document.getElementById("status");

if (!webhookUrl || !message) {
status.textContent = "Please enter both webhook URL and message.";
status.style.color = "red";
return;
}

const payload = { content: message };

try {
const response = await fetch(webhookUrl, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload)
});

if (response.status === 204) {
status.textContent = "Message sent successfully! ✅";
status.style.color = "green";
} else {
status.textContent = `Failed to send message. Status: ${response.status} ❌`;
status.style.color = "red";
}
} catch (error) {
status.textContent = "Error sending message: " + error;
status.style.color = "red";
}
});
