import {
  _createPopper,
  createComponent,
  error,
  exposeComponent,
  getComponent,
  getOptions,
  toggleWithTransition,
  validateTypes,
} from "../lib/utils";

function getMenu(el, Alpine, directive) {
  return getComponent({ el, Alpine, directive });
}

export function menu(
  el,
  { value, modifiers },
  { Alpine, evaluate },
  name = ""
) {
  if (!["menu", "listbox"].includes(name))
    error(
      "Can only be shared for 'x-listbox' 'x-menu' directives",
      `x-${name}`
    );

  if (!value) {
    const Default = {
      expose: null,
      trigger: "click",
      autoClose: "true",
      position: "bottom-start",
      display: "dynamic",
      offset: "0,2",
      strategy: "absolute",
      toggleFirstChild: false,
      popperInstance: {},
    };
    const DefaultType = {
      expose: "null|string",
      trigger: "string",
      autoClose: "boolean|string",
      position: "string",
      display: "string",
      offset: "string|array",
      strategy: "string",
      toggleFirstChild: "boolean",
      popperInstance: "",
    };
    const configUser = getOptions(el, evaluate);
    const config = { ...Default, ...configUser };

    validateTypes(config, DefaultType);

    const data_ = {
      main: el,
      toggle: null,
      menu: null,
      config,
      show: false,
    };
    const { key } = createComponent({ el, Alpine, evaluate, data: data_ });

    if (config.expose && key) {
      exposeComponent(config.expose, key, evaluate);
    }
  }
  // toggle
  else if (value == "toggle") {
    const { data } = getMenu(el, Alpine, name);
    data.toggle = el;

    const trigger = data.config.trigger;

    if (!trigger || trigger == "click") {
      el.addEventListener("click", (event) => {
        data.show = !data.show;
      });
    }
    if (trigger == "hover") {
      for (const evt of ["mouseenter", "mouseleave"]) {
        data.main.addEventListener(evt, () => {
          data.show = evt == "mouseenter" ? true : false;
        });
      }
    }

    document.addEventListener("click", (event) => {
      const composedPath = event.composedPath();
      const isMenuTarget = composedPath.includes(data.menu);
      const isButtonTarget = composedPath.includes(data.toggle);
      const { autoClose } = data.config;

      if (
        isButtonTarget ||
        (autoClose === "inside" && !isMenuTarget) ||
        (autoClose === "outside" && isMenuTarget)
      ) {
        return false;
      }

      data.show = false;
    });
  }
  // items
  else if (value == "items") {
    const { key, data } = getMenu(el, Alpine, name);
    data.config.toggleFirstChild = modifiers.includes("wrapper");
    data.menu = el;
    const { position, display, offset, strategy, toggleFirstChild } =
      data.config;

    const toggle_ = (show) => {
      if (display == "dynamic") {
        _createPopper(data, show, {
          position,
          offset,
          strategy,
          reference: data.main,
          menu: data.menu,
        });
      }

      // aria
      data.toggle?.setAttribute("aria-expanded", show ? "true" : "false");

      const elements = [el, toggleFirstChild && el.firstElementChild];
      toggleWithTransition(elements, show);

      data.toggle?.classList.toggle("open", show);
    };

    toggle_(data.show);

    Alpine.$data(el).$watch(`_x_nui.${key}.show`, (show) => {
      toggle_(show);
    });
  }
}

export default function (el, param, param1) {
  menu(el, param, param1, "menu");
}
