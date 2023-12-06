import {
  _createPopper,
  createComponent,
  error,
  exposeComponent,
  getComponent,
  getOptions,
  isElement,
  toggleWithTransition,
  validateTypes,
  toggleSelected,
} from "../lib/utils";
import scrollIntoView from "scroll-into-view-if-needed";

function getMenu(el, Alpine, directive) {
  return getComponent({ el, Alpine, directive });
}

function genId(target) {
  const main = target.closest("[x-listbox]");
  let indexes = [];
  let nc = target;
  while (nc != null) {
    if (nc == main) {
      break;
    }
    const parent = nc.parentElement;
    const siblingIndex = [...parent.children].indexOf(nc);
    nc = parent;
    indexes.push(siblingIndex);
  }

  const proximity = indexes.reverse().join("-");
  return proximity;
}

function checkVisible(el) {
  const isHidden = el.offsetParent === null;

  if (isHidden) {
    //  @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
    const position = window.getComputedStyle(el).getPropertyValue("position");
    const isBodyOrHtml = ["BODY", "HTML"].includes(el.tagName);
    if (position == "fixed" || isBodyOrHtml) {
      console.warn(
        "Could not check if the element is actually visible in the document.",
        { el }
      );
      return true;
    }
  }

  return !isHidden;
}

function scrollToOption(el) {
  if (el) {
    scrollIntoView(el, {
      behavior: "smooth",
      scrollMode: "if-needed",
    });
  }
}

function sortOptions(optionsEl = []) {
  return optionsEl
    .reduce((ac, el) => {
      const isVisible = checkVisible(el);
      if (isVisible) {
        ac.push({ el, id: genId(el), isVisible });
      }
      return ac;
    }, [])
    .sort((a, b) => a.id.localeCompare(b.id));
}

function getFirstOrLastOption(optionsEl = [], first = true) {
  const ids = sortOptions(optionsEl);
  return ids[first ? 0 : ids.length - 1];
}

function getPrevOrNextOption(optionsEl = [], lastId = "", prev = false) {
  const ids = sortOptions(optionsEl);
  const index = ids.findIndex((v) => v.id == lastId);
  const exists = index > -1;
  const isFirst = exists && index === 0;
  const isLast = exists && index === ids.length - 1;

  let item = null;
  if (isFirst && prev) item = ids[0];
  else if (isLast && !prev) item = ids[ids.length - 1];
  else if (exists) item = ids[prev ? index - 1 : index + 1];
  else item = ids[0];

  return item || {};
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
    const { key, components } = createComponent({
      el,
      Alpine,
      evaluate,
      data: data_,
    });

    if (config.expose && key) {
      exposeComponent(config.expose, key, evaluate);
    }

    // support for most standard keyboard menu interactions
    let lastItem = {};
    window.addEventListener("keydown", (evt) => {
      const data = components[key];
      const { show, options } = data || {};
      const keyCode = evt.key;

      if (!show || !Array.isArray(options) || options?.length === 0) {
        lastItem = {};
        return false;
      }

      // next or previous option
      if (["ArrowUp", "ArrowDown"].includes(keyCode)) {
        evt.preventDefault();

        const prev = keyCode == "ArrowUp";
        const prevItem = lastItem;
        const currentItem = getPrevOrNextOption(options, prevItem.id, prev);
        currentItem.el?.focus();

        lastItem = currentItem;

        scrollToOption(currentItem.el);
      }

      // select item
      if (keyCode == "Enter") {
        evt.preventDefault();

        if (data.show && Object.keys(lastItem).length) {
          // only for x-listbox
          if (isElement(lastItem.el) && Array.isArray(data.selected)) {
            toggleSelected(data, lastItem.el);
          }
          data.show = false;
        }
      }

      // close menu
      if (keyCode == "Escape") {
        evt.preventDefault();
        data.show = false;
      }

      // scroll first option
      if (keyCode == "Home") {
        evt.preventDefault();
        const currentItem = getFirstOrLastOption(options, true);
        currentItem.el?.focus();

        lastItem = currentItem;

        scrollToOption(currentItem.el);
      }

      // scroll last option
      if (keyCode == "End") {
        evt.preventDefault();
        const currentItem = getFirstOrLastOption(options, false);
        currentItem.el?.focus();

        lastItem = currentItem;

        scrollToOption(currentItem.el);
      }
    });
  }

  // toggle
  else if (value == "toggle") {
    const { data } = getMenu(el, Alpine, name);
    data.toggle = el;

    const trigger = data.config.trigger;

    if (name == "listbox") {
      el.setAttribute("role", "combobox");
    }

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

    // determine if it was clicked off
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

  // x-menu:items
  else if (value == "items") {
    const { key, data } = getMenu(el, Alpine, name);
    data.config.toggleFirstChild = modifiers.includes("wrapper");
    data.menu = el;
    const { position, display, offset, strategy, toggleFirstChild } =
      data.config;

    const toggle_ = (show) => {
      // force focus after closing
      if (!show) data.toggle?.focus();

      if (display == "dynamic") {
        _createPopper(data, show, {
          position,
          offset,
          strategy,
          reference: data.main,
          menu: data.menu,
        });
      }

      const elements = [el, toggleFirstChild && el.firstElementChild];
      toggleWithTransition(elements, show);

      // aria
      el.setAttribute("role", "listbox");
      data.toggle?.setAttribute("aria-expanded", `${show}`);

      data.toggle?.classList.toggle("open", show);
    };

    toggle_(data.show);

    Alpine.$data(el).$watch(`_x_nui.${key}.show`, (show) => {
      toggle_(show);
    });
  }

  // x-menu:item
  else if (value == "item") {
    const { data } = getMenu(el, Alpine, name);
    if (!Array.isArray(data.options)) data.options = [];
    data.options.push(el);
  }
}

export default function (el, param, param1) {
  menu(el, param, param1, "menu");
}
