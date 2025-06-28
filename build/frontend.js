import Konsole from "./Konsole.js";
import HTTP from "./HTTP.js";
const container = document.querySelector(".konsole");
const konsole = new Konsole(container);
konsole.register(new HTTP);
//# sourceMappingURL=frontend.js.map