import {
  createComponent,
  getComponent,
  getOptions,
  getOptionsIndividual,
  toggle,
  validateTypes,
  exposeComponent,
  error,
  toggleWithTransition,
} from "../lib/utils";

function getDialog(el, Alpine, directive) {
  return getComponent({ el, Alpine, directive });
}

export function dialog(
  el,
  { value, modifiers },
  { Alpine, evaluate },
  name = ""
) {
  if (!["dialog", "drawer"].includes(name))
    error(
      "Can only be shared for 'x-dialog' 'x-drawer' directives",
      `x-${name}`
    );

  // x-dialog || x-drawer
  if (!value) {
    const configDefault = {
      expose: "",
      backdrop: "", // or "static"
      keyboard: true,
      focus: true,
      autofocus: true,
    };
    const DefaultType = {
      autofocus: "boolean",
      focus: "boolean",
      keyboard: "boolean",
      backdrop: "null|string",
      expose: "null|string",
    };
    const configUser = getOptions(el, evaluate);
    const config = { ...configDefault, ...configUser };
    validateTypes(config, DefaultType);

    const { open, id } = getOptionsIndividual(el);
    const data = {
      main: el,
      show: open ? true : false,
      config,
      id,
    };

    const { key } = createComponent({ el, Alpine, evaluate, data });

    if (id) {
      window.addEventListener(`nui.show.${id}`, (e) => {
        const { data } = getDialog(el, Alpine, name);
        data.show = true;
      });
      window.addEventListener(`nui.hide.${id}`, (e) => {
        const { data } = getDialog(el, Alpine, name);
        data.show = false;
      });
      window.addEventListener(`nui.toggle.${id}`, (e) => {
        const { data } = getDialog(el, Alpine, name);
        data.show = !data.show;
      });
    }

    if (config.expose && key) {
      exposeComponent(config.expose, key, evaluate);
    }
  }
  // x-dialog:backdrop || x-dialog:panel
  if (value == "backdrop" || value == "panel") {
    const { data, key } = getDialog(el, Alpine, name);
    data.config.toggleFirstChild = modifiers.includes("wrapper");
    const config = data.config;
    const initOverflowValue = document.body.style.overflow || null;
    const toggle_ = (show) => {
      // aria
      if (value == "panel") {
        el.setAttribute("role", "dialog");
        if (show) {
          el.setAttribute("aria-modal", "true");
          el.removeAttribute("aria-hidden");

          if (config.focus) el.focus();

          if (config.autofocus) {
            setTimeout(() => {
              el?.querySelector("[x-nui\\:autofocus]")?.focus();
            }, 0);
          }
        } else {
          el.setAttribute("aria-hidden", "true");
          el.removeAttribute("aria-modal");
        }
      }

      document.body.style.overflow = show ? "hidden" : initOverflowValue;

      if (show && config.keyboard) {
        window.addEventListener("keyup", function (e) {
          if (e.key == "Escape") {
            data.show = false;
          }
        });
      }

      const elements = [el, config.toggleFirstChild && el.firstElementChild];
      toggleWithTransition(elements, show, "show");
    };

    toggle_(data.show);

    Alpine.$data(el).$watch(`_x_nui.${key}.show`, toggle_);

    if (value == "backdrop" && config.backdrop != "static") {
      el.addEventListener("click", () => {
        data.show = false;
      });
    }
  }

  // x-dialog:toggle
  if (value == "toggle") {
    el.addEventListener("click", (evt) => {
      const { data } = getDialog(el, Alpine, name);
      data.show = !data.show;
    });
  }
}

export default function (el, param, param1) {
  dialog(el, param, param1, "dialog");
}
