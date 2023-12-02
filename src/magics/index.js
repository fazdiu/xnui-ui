export default function (el, { Alpine }) {
  return {
    open(dialogDrawerID) {
      const evt = new CustomEvent(`nui.show.${dialogDrawerID}`);
      window.dispatchEvent(evt);
    },
    close(dialogDrawerID) {
      const evt = new CustomEvent(`nui.hide.${dialogDrawerID}`);
      window.dispatchEvent(evt);
    },
    toggle(dialogDrawerID) {
      const evt = new CustomEvent(`nui.toggle.${dialogDrawerID}`);
      window.dispatchEvent(evt);
    },
  };
}
