
import "regular-table";
import "regular-table/dist/css/material.css";
import "regular-table/dist/features/row_stripes.css";
import {alternateStripes} from "regular-table/dist/features/row_stripes";

import "regular-table/dist/features/area_mouse_selection.css";
import {addAreaMouseSelection} from "regular-table/dist/features/area_mouse_selection";

import "regular-table/dist/features/column_mouse_selection";
import {addColumnMouseSelection} from "regular-table/dist/features/column_mouse_selection";

import "regular-table/dist/features/row_mouse_selection";
import {addRowMouseSelection} from "regular-table/dist/features/row_mouse_selection";

class RegularTableWithExtras {


}


const DATA = [
    [0, 1, 2, 3, 4, 5],
    ["A", "B", "C", "D", "E", "F"],
    [true, false, true, false, true, false],
];

function getDataSlice(x0, y0, x1, y1) {
    console.log(x0, y0, x1, y1);
    return {
        num_rows: DATA[0].length,
        num_columns: DATA.length,
        row_headers: DATA[0].map(rec => [`Row ${rec}`]),
        column_headers: [1, 2, 3].map(rec => [`Col ${rec}`]),
        data: DATA.slice(x0, x1).map((col) => col.slice(y0, y1)),
    };
}

const style = `
<style>
regular-table {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
</style>
`;

window.addEventListener("load", () => {
    console.log("ready to load");
    document.body.innerHTML += style;

    const table = document.createElement("regular-table");
    document.body.appendChild(table);

    table.setDataListener(getDataSlice);
    table.draw();
    alternateStripes(table);
    addAreaMouseSelection(table);
    // addColumnMouseSelection(table);
    // addRowMouseSelection(table);

});