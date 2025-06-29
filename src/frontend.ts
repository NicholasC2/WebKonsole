import Konsole from "./Konsole.js";
const container = document.querySelector(".konsole") as HTMLDivElement;
const konsole = new Konsole(container);
konsole.update();