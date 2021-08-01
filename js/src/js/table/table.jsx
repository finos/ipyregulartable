import * as React from "react";

import "regular-table";
import {alternateStripes} from "regular-table/dist/features/row_stripes";
import {addAreaMouseSelection} from "regular-table/dist/features/area_mouse_selection";

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


export class RegularTableComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // position of the cursor
            cursor: {
                x: null,
                y: null,
            },
            selection : {
                x0: null,
                x1: null,
                y0: null,
                y1: null,
            },
        }

    }

    componentDidMount() {
        const {mountPoint} = this.props;
        this.table = document.createElement("regular-table");
        mountPoint.appendChild(this.table);
        this.table.setDataListener(getDataSlice);
        this.table.draw();
        alternateStripes(this.table);
        addAreaMouseSelection(this.table);
    }

    render() {
        return <slot />;
    }
};
