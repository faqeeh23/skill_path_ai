import "sweetalert2/dist/sweetalert2.min.css";
let library;
let generation = 0;
export async function showMessage(options) {
  if (
    options.toast &&
    library?.isVisible() &&
    !library.getPopup()?.classList.contains("swal2-toast")
  )
    return { isDismissed: true };
  const current = ++generation;
  const { default: Swal } = await import("sweetalert2");
  library = Swal;
  if (
    options.toast &&
    Swal.isVisible() &&
    !Swal.getPopup()?.classList.contains("swal2-toast")
  )
    return { isDismissed: true };
  if (current !== generation) return { isDismissed: true };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return Swal.fire({
    customClass: {
      popup: "sp-alert",
      confirmButton: "sp-alert-confirm",
      cancelButton: "sp-alert-cancel",
    },
    buttonsStyling: false,
    ...(reduced ? { showClass: { popup: "" }, hideClass: { popup: "" } } : {}),
    ...options,
  });
}
export function confirmAction(options) {
  return showMessage({
    icon: "warning",
    showCancelButton: true,
    focusCancel: true,
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    ...options,
  });
}
export function closeAlert() {
  generation++;
  library?.close();
}

export function setAlertBusy(busy) {
  if (
    !library?.isVisible() ||
    library.getPopup()?.classList.contains("swal2-toast")
  )
    return;
  if (busy) {
    library.showLoading();
    library.disableButtons();
  } else {
    library.hideLoading();
    library.enableButtons();
  }
}

import "../styles/alerts.css";
