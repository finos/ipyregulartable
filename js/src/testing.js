
import "./js/table";


window.addEventListener("load", () => {
    console.log("ready to load");
    const el = document.createElement("regular-table-extras");
    el.setAttribute("stripes", true);
    el.setAttribute("cursor", true);
    el.setAttribute("selection", true);
    el.setAttribute("editable", true);
    document.body.appendChild(el);
});