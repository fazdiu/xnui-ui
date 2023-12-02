import "./style.css";
import Alpine from "alpinejs";

import nuiUI from "xnui-ui";
Alpine.plugin(nuiUI);

window.Alpine = Alpine;
window.Alpine.start();

console.log("loaded");
