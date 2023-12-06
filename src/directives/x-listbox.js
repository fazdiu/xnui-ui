import {
  getComponent,
  getOptions,
  getOptionsIndividual,
  toggle,
  validateTypes,
  toggleSelected,
} from "../lib/utils";
import { menu } from "./x-menu";

const directive = "listbox";

function toString(arr) {
  return arr.map((el) => el?.textContent).join(",");
}

function getListbox(el, Alpine) {
  return getComponent({ el, Alpine, directive });
}

export default function (el, param, param1) {
  if (param.value == "options") {
    param.value = "items";
  }

  menu(el, param, param1, directive);

  const { value } = param;
  const { Alpine, evaluate } = param1;

  // x-listbox
  if (!value) {
    const configDefault = {
      multiple: false,
      minLength: 3,
    };
    const DefaultType = {
      multiple: "boolean",
      minLength: "number",
    };
    const configUser = getOptions(el, evaluate);
    const config = { ...configDefault, ...configUser };
    const { data } = getListbox(el, Alpine);

    validateTypes(config, DefaultType);

    const multiple = config.multiple;
    const minLength = config.minLength;

    data.config.multiple =
      (typeof multiple === "boolean" && multiple) ||
      (typeof multiple === "string" && multiple == "");
    data.config.minLength = !isNaN(Number(minLength)) ? Number(minLength) : 2;

    data.selected = [];
    data.options = [];
    data.noResult = false;
  }

  // x-listbox:option
  if (value == "option") {
    const { data, key } = getListbox(el, Alpine);
    const selected = getOptionsIndividual(el).selected;

    data.options.push(el);

    el.setAttribute("role", "option");
    el.setAttribute("tabindex", "0");

    Alpine.$data(el).$watch(`_x_nui.${key}.selected`, (arr) => {
      const isSelected = arr.indexOf(el) > -1;
      if (isSelected) {
        const prevSelected = el.classList.contains("selected");
        if (!prevSelected) {
          el.classList.add("selected");
        }
        el.setAttribute("aria-selected", "true");
      } else {
        el.classList.remove("selected");
        el.setAttribute("aria-selected", "false");
      }
    });

    if ((typeof selected === "boolean" && selected) || selected == "") {
      toggleSelected(data, el);
    }

    el.addEventListener("click", (event) => {
      const { data } = getListbox(el, Alpine);
      toggleSelected(data, el);
    });
  }

  // x-listbox:text
  if (value == "text") {
    const { key, data } = getListbox(el, Alpine);
    const isInput = el.tagName == "INPUT";
    const values = toString(data.selected);

    isInput ? (el.value = values) : (el.innerHTML = values);

    Alpine.$data(el).$watch(`_x_nui.${key}.selected`, (arr) => {
      const values = toString(arr);
      isInput ? (el.value = values) : (el.innerHTML = values);
    });
  }

  // x-listbox:search
  if (value == "search") {
    const { data } = getListbox(el, Alpine);

    el.addEventListener("input", (event) => {
      const query = el.value;
      const isEmpty = query.length == 0;

      const els = data.options.filter((el_) => {
        if (isEmpty) toggle(el_, true);

        if (query.length >= data.config.minLength) {
          const show = isEmpty
            ? true
            : el_.textContent
                .toLowerCase()
                .replace(/\s+/g, "")
                .includes(query.toLowerCase().replace(/\s+/g, ""));
          toggle(el_, show);

          return show;
        }

        return true;
      });
      data.noResult = els.length < 1;
    });
  }
}
