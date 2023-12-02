import {
  createComponent,
  exposeComponent,
  getComponent,
  getOptions,
  getOptionsIndividual,
  isElement,
  validateTypes,
  warn,
} from "../lib/utils";

function getDisclosure(el, Alpine) {
  return getComponent({ el, Alpine, directive: "disclosure" });
}

function hide(el) {
  el.style.transition = "height 0.25s cubic-bezier(0.4, 0, 0.2, 1)";
  el.style.overflow = "hidden";
  el.style.height = 0;
}

function show(el) {
  el.style.transition = "height 0.25s cubic-bezier(0.4, 0, 0.2, 1)";
  el.style.height = el.scrollHeight + "px";

  setTimeout(() => {
    el.style.overflow = null;
  }, 100);
}

export default function (el, { value }, { Alpine, evaluate }) {
  // x-disclosure
  if (!value) {
    const configDefault = {
      expose: "",
    };
    const DefaultType = {
      expose: "null|string",
    };
    const configUser = getOptions(el, evaluate);
    const config = { ...configDefault, ...configUser };
    validateTypes(config, DefaultType);

    const data = {
      main: el,
      active: null,
      items: [],
      config,
    };
    const { key } = createComponent({ el, Alpine, evaluate, data });

    if (config.expose && key) {
      exposeComponent(config.expose, key, evaluate);
    }
  }
  // x-disclosure:toggle
  if (value == "toggle") {
    const { data } = getDisclosure(el, Alpine);
    const { target } = getOptionsIndividual(el);
    const target_ =
      target && target.trim().length > 0 ? target : el.nextElementSibling;
    data.items.push({ toggle: el, panel: target_ });

    el.addEventListener("click", (event) => {
      const { panel } = data.items.find((v) => v.toggle === el) || {};
      if (isElement(panel)) {
        const isActive = panel === data.active;
        data.active = isActive ? null : panel;
      } else {
        warn("E150 No html element has been associated with this tab.", el)
      }
    });
  }
  // x-disclosure:panel
  if (value == "panel") {
    const { data, key } = getDisclosure(el, Alpine);
    const { id, open } = getOptionsIndividual(el);
    if (id) {
      const item = data.items.find((v) => {
        const panel = v.panel;
        return typeof panel === "string" && panel == id;
      });

      if (item) {
        item.panel = el;
      }
    }

    const toggle_ = (panelEl) => {
      const item = data.items.find((v) => v.panel == el);
      const show_ = isElement(panelEl) && el === panelEl;

      show_ ? show(el) : hide(el);

      el.classList.toggle("show", show_);
      item.toggle.classList.toggle("show", show_);
    };

    toggle_(typeof open !== "undefined" ? el : null);

    Alpine.$data(el).$watch(`_x_nui.${key}.active`, toggle_);
  }
}
