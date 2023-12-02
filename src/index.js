import xDisclosure from "./directives/x-disclosure";
import xListbox from "./directives/x-listbox";
import xMenu from "./directives/x-menu";
import xTab from "./directives/x-tab";
import xTooltip from "./directives/x-tooltip";
import xDialog from "./directives/x-dialog";
import magics from "./magics";
import xDrawer from "./directives/x-drawer";
import xGroup from "./directives/x-group";

export default function (Alpine) {
  Alpine.directive("menu", xMenu);
  Alpine.directive("listbox", xListbox);
  Alpine.directive("disclosure", xDisclosure);
  Alpine.directive("tab", xTab);
  Alpine.directive("dialog", xDialog);
  Alpine.directive("drawer", xDrawer);
  Alpine.directive("tooltip", xTooltip);
  Alpine.directive("group", xGroup);
  Alpine.magic("nui", magics);
}
