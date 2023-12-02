import plugins from "../src/index";

document.addEventListener("alpine:init", () => {
  plugins(Alpine);
});
