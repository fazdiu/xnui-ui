import { createPopper } from "@popperjs/core";
import { once } from "alpinejs/src/utils/once";

const sizes = {};
/**
 *
 * @param {Object} data
 * @param {Boolean} show
 * @param {Object} options
 * @param {Element} options.reference
 * @param {Element} options.menu
 * @param {String|Array} options.offset
 * @param {String} options.position
 * @param {String|Element|Function} options.boundary
 * @param {('absolute' | 'fixed')} options.strategy
 */
export function _createPopper(data, show, options) {
  const invertPosition = (position) => {
    const isRight = ["right-start", "right-end", "right"].includes(position);
    const isLeft = ["left-start", "left-end", "left"].includes(position);
    if ((isRight || isLeft) && isRTL()) {
      return isLeft
        ? position.replace("left", "right")
        : position.replace("right", "left");
    }
    return position;
  };

  const updatePopper = () => {
    data.popperInstance.setOptions((options) => ({
      ...options,
      modifiers: [
        ...options.modifiers,
        { name: "eventListeners", enabled: true },
        // @see https://github.com/floating-ui/floating-ui/issues/794
        {
          name: "sameWidth",
          enabled: true,
          fn: ({ state }) => {
            state.elements.popper.style.minWidth = `${state.elements.reference.offsetWidth}px`;
          },
          phase: "beforeWrite",
          requires: ["computeStyles"],
          effect: ({ state }) => {
            state.elements.popper.style.minWidth = `${state.elements.reference.offsetWidth}px`;
          },
        },
      ],
    }));

    // Update its position
    data.popperInstance.update();
  };

  const { reference, menu, offset, strategy, position, boundary } = options;

  if (typeof createPopper === "undefined") {
    error(
      'E175 x-nui components require Popper (https://popper.js.org)'
    );
  }

  if (!isObject(reference) || !isObject(menu)) {
    error(
      "E160 To create popper requires the `reference` element and the `menu` element"
    );
  }

  const offset_ = typeof offset === "string" ? offset.split(",") : offset;
  const position_ = invertPosition(position);

  if (!data.popperInstance) {
    data.popperInstance = createPopper(reference, menu, {
      strategy: strategy || "absolute",
      placement: position_ || "bottom-start",
      modifiers: [
        {
          name: "preventOverflow",
          options: {
            boundary: boundary || "clippingParents",
          },
        },
        {
          name: "offset",
          options: {
            offset: offset_?.map((v) => Number(v)) || [0, 2],
          },
        },
      ],
    });

    new ResizeObserver(() => {
      const currentHeight = reference.offsetHeight;
      const currentWidth = reference.offsetWidth;
      const { height, width } = sizes[reference] || {};
      if (height != currentHeight || width != currentWidth) {
        sizes[reference] = { height: currentHeight, width: currentWidth };

        updatePopper();
      }
    }).observe(reference);
  }

  if (show) {
    updatePopper();
  } else {
    data.popperInstance.setOptions((options) => ({
      ...options,
      modifiers: [
        ...options.modifiers,
        { name: "eventListeners", enabled: false },
        { name: "sameWidth", enabled: false },
      ],
    }));
  }
}

/**
 * Determines the direction of the text in the document (rtl)
 * @returns {Boolean}
 */
export function isRTL() {
  return document.documentElement.dir === "rtl";
}

/**
 * Determine if it is an html element
 * @param {Element} element
 * @returns
 */
export function isElement(element) {
  return element instanceof Element || element instanceof HTMLDocument;
}

/**
 * Toggle element visibility with support for x-transition.
 * @param {Element[]} elements
 * @param {Boolean} show
 * @param {String} className
 * @returns
 */
export function toggleWithTransition(elements, show_, className = "open") {
  elements = Array.isArray(elements) ? elements : [elements];

  const toggleClass = (el, show) => {
    if (show) {
      setTimeout(() => el.classList.add(className), 0);
    } else {
      el.classList.remove(className);
    }
  };

  for (const el of elements) {
    if (!isElement(el)) continue;

    const hide = () => {
      el.style.setProperty("display", "none");
      el._x_isShown = false;
      toggleClass(el, false);
    };

    const show = () => {
      if (el.style.length === 1 && el.style.display === "none") {
        el.removeAttribute("style");
      } else {
        el.style.removeProperty("display");
      }
      el._x_isShown = true;
      toggleClass(el, true);
    };

    // We are wrapping this function in a setTimeout here to prevent
    // a race condition from happening where elements that have a
    // @click.away always view themselves as shown on the page.
    const clickAwayCompatibleShow = () => setTimeout(show);
    const transition = (value) => {
      if (typeof el._x_toggleAndCascadeWithTransitions === "function") {
        el._x_toggleAndCascadeWithTransitions(el, value, show, hide);
      } else {
        value ? clickAwayCompatibleShow() : hide();
      }
    };
    const toggleDisplay = once(transition, transition);

    toggleDisplay(show_);
  }
}

/**
 * Toggle element visibility
 * @param {Element} el
 * @param {Boolean} show
 * @returns
 */
export function toggle(el, show = false) {
  if (show) {
    if (el.style.length === 1 && el.style.display === "none") {
      el.removeAttribute("style");
    } else {
      el.style.removeProperty("display");
    }
  } else {
    el.style.setProperty("display", "none");
  }
}

/**
 * Shows an error message in the console
 * @param  {String} message
 * @param  {...any} param
 */
export function error(message, ...param) {
  console.error(message, ...param);
}

/**
 * Shows an warning message in the console
 * @param  {String} message
 * @param  {...any} param
 */
export function warn(message, ...param) {
  console.warn(message, ...param);
}

/**
 * Determines if the value is an object
 * @param {*} value
 * @returns
 */
export function isObject(value) {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}

/**
 * Determines if the value is a number
 */
export function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Convert string 'camelcase' to 'dashed'
 * @param {String} str
 * @returns
 */
export function convertToDashed(str) {
  return str.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
}

/**
 * Convert string 'dashed' to 'camelcase'
 * @param {String} str
 * @returns {String}
 */
export function convertToCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Validate data types
 * @param {Object} config
 * @param {Object} types
 */
export function validateTypes(config, types) {
  const types_ = Object.keys(types);

  for (const key of types_) {
    const rules = types[key].split("|").filter(Boolean);

    if (rules.length) {
      const passes = rules.some((r) => {
        const value = config[key];
        const rule = r.trim();

        if (rule == "array") {
          return Array.isArray(value);
        }
        if (rule == "null") {
          return !value;
        }

        if (["boolean", "string", "function"].includes(rule)) {
          return typeof value === rule;
        }

        if (rule == "element") {
          return isElement(value);
        }

        if (rule == "number") {
          return isNumeric(value);
        }
        return false;
      });

      if (!passes) {
        error(`E170 The data set in '${key}' is not valid.`);
      }
    }
  }

  return config;
}

/**
 * Gets the options set in attributes that start with 'x-nui:*'
 * @param {Element} el
 * @returns {Object}
 */
export function getOptionsIndividual(el) {
  if (!el.hasAttributes()) {
    return {};
  }

  const KEY_INLINE = "x-nui:";
  const res = {};
  for (const attr of el.attributes) {
    const name = attr.name;
    if (name.startsWith(KEY_INLINE)) {
      const n = convertToCamelCase(name.slice(KEY_INLINE.length));
      let value = attr.value.trim();

      if (["true", "false"].includes(value)) {
        value = value == "true" ? true : false;
      }

      if (value.length == 0) {
        value = true;
      }

      res[n] = value;
    }
  }
  return res;
}

/**
 * Get all options declared attribute 'x-nui'
 * @param {Element} el
 * @param {Function} evaluate
 * @returns {Object}
 */
export function getOptionsBlock(el, evaluate) {
  const KEY_OBJ = "x-nui";
  if (el.hasAttribute(KEY_OBJ)) {
    const value = evaluate(el.getAttribute(KEY_OBJ));

    if (!isObject(value)) {
      error("E120 You must provide a value of type object in 'x-nui'", el);
    }

    return value;
  }

  return {};
}

/**
 * Gets all options (bulk and individual) set.
 * @param {Element} el
 * @param {Function} evaluate
 * @returns {Object}
 */
export function getOptions(el, evaluate) {
  const configB = getOptionsBlock(el, evaluate);
  const configI = getOptionsIndividual(el);

  return { ...configB, ...configI };
}

/**
 * Gets all created components
 * @param {Object} param
 * @param {Object} param.Alpine
 * @param {Function} param.evaluate
 * @returns
 */
export function getComponents({ el, Alpine, evaluate }) {
  const x_data = Alpine.$data(el)._x_nui;

  // create variable internal
  if (!x_data) {
    evaluate(`$data._x_nui={}`);
    return Alpine.$data(el)._x_nui;
  }

  return x_data;
}

/**
 * Create and save the component internally
 * @param {Object} param
 * @param {Object} param.Alpine
 * @param {Function} param.evaluate
 * @param {Object} param.data Warning: data.main is reserved
 */
export function createComponent({ el, Alpine, evaluate, data }) {
  const all = getComponents({ el, Alpine, evaluate });
  const key = `component_${Object.keys(all).length}`;

  // Prevents an element from having more than one component simultaneously.
  const exists = Object.keys(all).some((c) => all[c] && all[c].main == el);
  if (exists) {
    error("E130 The element can only have one main component.", el);
  }

  all[key] = Object.assign(data, { main: el });

  return { key, components: all };
}

/**
 * Exposes the internal variables of the component in the markup
 * @param {String} variable
 * @param {String} keyComponent
 * @param {Function} evaluate
 */
export function exposeComponent(variable, keyComponent, evaluate) {
  if (
    variable &&
    typeof variable === "string" &&
    keyComponent &&
    typeof keyComponent === "string"
  ) {
    evaluate(`${variable}=_x_nui.${keyComponent}`);
  } else {
    error('E135 The value set in the "expose" variable is not valid.');
  }
}

/**
 * Gets the component
 * @param {Object} param
 * @param {Element} param.el
 * @param {Object} param.Alpine
 * @param {String} param.directive 'x-${directive}'
 */
export function getComponent({ el, Alpine, directive }) {
  const selector = `[x-${directive}]`;
  const closest = el.closest(selector);
  const x_data = Alpine.$data(el)._x_nui;

  if (!closest) {
    error(
      `E125 You must declare the parent parent element for '${selector}'`,
      el
    );
  }

  if (!x_data) {
    error(
      `E110 Before obtaining the subcomponent '${selector}' you must declare the main component.`,
      el
    );
  }

  const key = Object.keys(x_data).find((c) => x_data[c]?.main === closest);

  return { key, data: x_data[key] };
}
