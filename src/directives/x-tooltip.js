import {
  _createPopper,
  getOptions,
  validateTypes,
  exposeComponent,
} from "../lib/utils";

export default function (el, { expression }, { evaluate }) {
  // x-tooltip
  const configDefault = {
    container: "",
    boundary: "clippingParents",
    position: "top",
    offset: "0,0",
    title: "",
    trigger: "hover",
    expose: null,
  };
  const DefaultType = {
    container: "string|element",
    boundary: "string|element",
    position: "string",
    offset: "string|array",
    title: "null|string",
    trigger: "null|string",
    expose: "null|string",
  };
  const configUser = getOptions(el, evaluate);
  const config = { ...configDefault, ...configUser };

  validateTypes(config, DefaultType);

  const text = expression || config.title;
  const { trigger, position, offset, boundary, container } = config;
  const events =
    trigger == "hover"
      ? ["mouseenter", "mouseleave"]
      : trigger == "focus"
      ? ["focus", "blur"]
      : [];
  let tooltip = null;

  for (const event of events) {
    el.addEventListener(event, (evt) => {
      const inside = ["mouseenter", "focus"].includes(event);
      const outside = ["mouseleave", "blur"].includes(event);

      if (inside && !tooltip) {
        tooltip = document.createElement("div");
        tooltip.setAttribute("role", "tooltip");
        tooltip.classList.add("tooltip", "show");

        const arrow = document.createElement("div");
        arrow.classList.add("tooltip-arrow");
        tooltip.appendChild(arrow);

        const inner = document.createElement("div");
        inner.classList.add("tooltip-inner");
        inner.innerHTML = text;
        tooltip.appendChild(inner);

        document.querySelector(container || "body").appendChild(tooltip);

        _createPopper(tooltip, true, {
          reference: el,
          menu: tooltip,
          offset,
          position,
          boundary,
        });
      }
      if (outside && tooltip) {
        tooltip.remove();
        tooltip = null;
      }
    });
  }

  if (config.expose && key) {
    exposeComponent(config.expose, key, evaluate);
  }
}
