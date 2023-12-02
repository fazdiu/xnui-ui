import "./style.css";
import Alpine from "alpinejs";

import nuiUI from "nui-ui";
Alpine.plugin(nuiUI);

window.Alpine = Alpine;
window.Alpine.start();

console.log("loaded");
