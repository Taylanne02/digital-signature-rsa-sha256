const messageTimers = new WeakMap();

function showMessage(element, text, type = "success", duration = 12000) {
  if (!element) return;
  element.className = `message ${type}`;
  element.textContent = text;
  element.classList.add("show");

  const previousTimer = messageTimers.get(element);
  if (previousTimer) {
    clearTimeout(previousTimer);
  }

  const timer = setTimeout(() => {
    element.classList.remove("show");
    element.classList.add("hide");
  }, duration);

  messageTimers.set(element, timer);
}

function clearMessage(element) {
  if (!element) return;
  element.className = "message";
  element.textContent = "";
}
