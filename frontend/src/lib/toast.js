export const toast = {
  success(title, description) {
    emitToast("success", title, description);
  },

  error(title, description) {
    emitToast("error", title, description);
  },

  warning(title, description) {
    emitToast("warning", title, description);
  },

  info(title, description) {
    emitToast("info", title, description);
  },

  queueSuccess(title, description) {
    queueToast("success", title, description);
  },

  queueError(title, description) {
    queueToast("error", title, description);
  },
};

function emitToast(type, title, description) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("chaosforge:toast", {
      detail: {
        id: crypto.randomUUID(),
        type,
        title,
        description,
      },
    }),
  );
}

function queueToast(type, title, description) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(
    "chaosforge:queued-toast",
    JSON.stringify({ type, title, description }),
  );
}
