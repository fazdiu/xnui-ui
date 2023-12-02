import {
  createComponent,
  error,
  exposeComponent,
  getOptions,
  getComponent,
  validateTypes,
} from "../lib/utils";

function getGroup(el, Alpine) {
  return getComponent({ el, Alpine, directive: "group" });
}

function getElement(el1, el2) {
  if (!el1 && !el2) error("Both elements are required.", { el1, el2 });

  let a = el1;
  while (a) {
    if (el2 === a) break;
    if (a.matches("[x-group\\:option]")) return a;

    a = a.parentElement;
  }

  return false;
}

export default function (el, { value }, { Alpine, evaluate }) {
  // x-group
  if (!value) {
    const configDefault = {
      expose: null,
    };
    const DefaultType = {
      expose: "null|string",
    };
    const configUser = getOptions(el, evaluate);
    const config = { ...configDefault, ...configUser };

    validateTypes(config, DefaultType);

    const data = {
      main: el,
      selected: [],
      checks: [],
    };
    const { key } = createComponent({ el, Alpine, evaluate, data });

    if (config.expose && key) {
      exposeComponent(config.expose, key, evaluate);
    }

    Alpine.$data(el).$watch(`_x_nui.${key}.selected`, (selected) => {
      const { data } = getGroup(el, Alpine);
      const main = data.main;

      data.checks.forEach((checkEl) => {
        if (main && checkEl) {
          const option = getElement(checkEl, main);
          option.classList.toggle("selected", checkEl.checked);
        }
      });
    });
  }

  // x-group:option
  if (value == "option") {
  }

  // x-group:check
  if (value == "check") {
    const { data } = getGroup(el, Alpine);
    const isValid =
      el.tagName == "INPUT" && ["radio", "checkbox"].includes(el.type);
    const toggle_ = () => {
      const { data } = getGroup(el, Alpine);
      const checked = el.checked;
      const i = data.selected.findIndex((s) => s === el);
      if (!checked && i > -1) {
        data.selected.splice(i, 1);
      }
      if (checked) {
        data.selected.push(el);
      }
    };

    if (!isValid)
      error('E155 The element type is not valid for "x-group:check"',el);

    data.checks.push(el);

    toggle_();

    el.addEventListener("change", (evt) => {
      toggle_();
    });
  }
}
