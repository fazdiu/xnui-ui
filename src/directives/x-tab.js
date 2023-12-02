import {
  createComponent,
  error,
  getComponent,
  getOptions,
  getOptionsIndividual,
  isElement,
  exposeComponent,
  validateTypes,
  warn,
} from "../lib/utils";

function getTab(el, Alpine) {
  return getComponent({ el, Alpine, directive: "tab\\:group" });
}

export default function (el, { value }, { Alpine, evaluate }) {
  // x-tab:group
  if (value == "group") {
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
    };
    const { key } = createComponent({ el, Alpine, evaluate, data });

    if (config.expose && key) {
      exposeComponent(config.expose, key, evaluate);
    }
  }
  // x-tab
  if (!value) {
    const { data } = getTab(el, Alpine);
    const { target } = getOptionsIndividual(el);

    if (!target) {
      warn("E140 The 'x-tab' must have a target set 'x-nui:target'", el);
    }

    data.items.push({ button: el, panel: target });

    el.addEventListener("click", (event) => {
      const { panel } = data.items.find((v) => v.button === el) || {};
      if (isElement(panel)) {
        data.active = panel;
      } else {
        warn(
          "E150 No valid html elements have been associated with this tab.",
          el
        );
      }
    });
  }
  // x-tab:panel
  if (value == "panel") {
    const { data, key } = getTab(el, Alpine);
    const { id, open } = getOptionsIndividual(el);

    if (!id) {
      warn("E145 The 'x-tab:panel' must have an id 'x-nui:id'");
    } else {
      const item = data.items.find((v) => {
        const panel = v.panel;
        return typeof panel === "string" && panel == id;
      });

      item.panel = el;

      const toggle_ = (panelEl) => {
        const item = data.items.find((v) => v.panel == el);
        const show = isElement(panelEl) && el === panelEl;

        el.style.display = show ? null : "none";
        el.classList.toggle("show", show);
        item.button.classList.toggle("show", show);
      };

      toggle_(typeof open !== "undefined" ? el : null);

      Alpine.$data(el).$watch(`_x_nui.${key}.active`, toggle_);
    }
  }
}
