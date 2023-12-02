import plugin from "tailwindcss/plugin";
import animations from "./src/animations/object";

export default function () {
  return plugin(function ({ addVariant, addUtilities }) {
    addVariant("nui-selected", "&.selected");
    addVariant("nui-group-selected", ".selected &");
    addVariant("nui-show", "&.show");
    addVariant("nui-group-show", ".show &");
    addVariant("nui-open", "&.open");
    addVariant("nui-group-open", ".open &");

    addUtilities(animations);
  });
}
