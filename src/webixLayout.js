"use strict";
// Webix Layout: (params needs to be defined elsewhere)

var dtableparams = [{
        id: "name",
        header: "Name",
        width: 180,
        sort: "string",
    },
    {
        id: "layer",
        header: "Layer",
        width: 50,
        sort: "int",
        editor: "text"
    },
    {
        id: "lut",
        header: "Color",
        sort: "string",
        editor: "text"
    },
    {
        id: "alpha",
        header: "Alpha",
        width: 50,
        sort: "int",
        editor: "text"
    },
    {
        id: "min",
        header: "Min",
        width: 50,
        sort: "int",
        editor: "text"
    },
    {
        id: "max",
        header: "Max",
        width: 60,
        sort: "int",
        editor: "text"
    },
    {
        id: "visible",
        header: "Visible",
        width: 60,
        sort: "int",
        editor: "text"
    }
]

var dtable = { // Datatable:
    view: "datatable",
    id: "grid",
    width: 570,
    columns: dtableparams, // column names and ids
    editable: true,
    editaction: "dblclick",
    scroll: false,
    select: true,
    on: {
        "onAfterEditStop": function (state, editor, ignoreUpdate) {
            if (state.value != state.old) {
                let item = $$("grid").getItem(editor.row); // get name of image for row changed
                let iname = item.name;
                let layerN = item.layer;
                let col = editor.column;
                let myViewer = papayaContainers[0].viewer;
                console.log(col);

                if (col == "lut") {
                    params[iname]["lut"] = state.value;
                    papayaContainers[0].viewer.screenVolumes[layerN].changeColorTable(myViewer, params[iname]["lut"]);
                    papayaContainers[0].viewer.drawViewer(true, false);
                    console.log(`Value Changed: lut ${state.value}`);
                }
                if (col == "alpha") {
                    params[iname]["alpha"] = parseInt(state.value);
                    papayaContainers[0].viewer.screenVolumes[layerN].alpha = params[iname]["alpha"];
                    papayaContainers[0].viewer.drawViewer(true, false);
                    console.log(`Value Changed: alpha ${state.value}`);
                }
                if (col == "min") {
                    params[iname]["min"] = parseInt(state.value);
                    papayaContainers[0].viewer.screenVolumes[layerN].min = params[iname]["min"];
                    papayaContainers[0].viewer.drawViewer(true, false);
                    console.log(`Value Changed: min ${state.value}`);
                }
                if (col == "max") {
                    params[iname]["max"] = parseInt(state.value);
                    papayaContainers[0].viewer.screenVolumes[layerN].max = params[iname]["max"];
                    papayaContainers[0].viewer.drawViewer(true, false);
                    console.log(`Value Changed: max ${state.value}`);
                }
                if (col == "visible") {
                    params[iname]["visible"] = parseInt(state.value);
                    if (params[iname]["visible"] == 1) {
                        papaya.Container.showImage(0, layerN);
                        console.log(`Value Changed: ON ${state.value}`);
                    } else {
                        papaya.Container.hideImage(0, layerN)
                        console.log(`Value Changed: OFF ${state.value}`);
                    }
                }
            } else {
                console.log("No Change");
            }
        }
    }
}
//$$("grid").getItem(1549064114065)
function setupPanels() {
    console.log("setupPanels");

    var papayaColorTables = ["Greyscale", "Spectrum",
        "Overlay (Positives)", "Overlay (Negatives)",
        "Hot-and-Cold", "Gold",
        "Red Overlay", "Green Overlay",
        "Blue Overlay", "Fire"
    ]

    // Webix Panels:
    var leftPanel = {
        rows: [{
                view: "template",
                template: "Images",
                type: "header"
            }, // text
            {
                view: "template",
                template: "Girder Folder",
                type: "header"
            }, // TODO: Show girder folder name used to get images, allow dynamic changing and image reloading
            dtable,
        ],
    };

    var middlePanel = {
        rows: [{
                view: "template",
                template: "Viewer",
                type: "header"
            }, // Header
            {
                view: "webixPapaya"
            } // Papaya Viewer
        ]
    };

    // Initial values for controls:
    var layerN = 0; // initial image index
    var imageName = params['imageNames'][layerN]; // initial image name
    var imageValues = params[imageName]; // initial parameters for image
    console.log(imageValues)

    // indexes of all images as string
    var iterimages = [];
    for (var i = 0; i < params['imageNames'].length; i++) {
        iterimages.push(i.toString());
    }

    var rightPanel = {
        rows: [{
                view: "template",
                template: "Controls",
                height: 50,
                type: "header"
            }, // text
            {
                view: "combo",
                id: "layerCBox",
                label: "Layer",
                inputWidth: 300,
                options: iterimages,
                value: layerN.toString(),
                on: {
                    onChange: function (newv, oldv) {
                        console.log(oldv, newv);
                        layerN = parseInt(newv); // image index
                        imageValues = params[params['imageNames'][layerN]];
                        console.log(imageValues);
                        $$("colorCBox").setValue(imageValues["lut"]);
                        $$("visibilitySwitch").setValue(imageValues["visible"]);
                        $$("alphaCounter").setValue(imageValues["alpha"]);
                        $$("minCounter").setValue(imageValues["min"]);
                        $$("maxCounter").setValue(imageValues["max"]);
                    }, // onChange
                }, // on event
            }, // combobox
            {
                view: "switch",
                id: "visibilitySwitch",
                label: "Visible",
                value: imageValues["visible"], // initial value for layer 0
                onLabel: "on",
                offLabel: "off",
                on: {
                    onItemClick: function (newv, oldv) {
                        layerN = parseInt($$("layerCBox").getInputNode().value); // Obtain current layer int from layerCBox
                        //papayaContainers[0].viewer.toggleOverlay(layerN); // toggles layer visibility
                        imageName = params['imageNames'][layerN];
                        if (params[imageName]["visible"] == 1) {
                            papaya.Container.hideImage(0, layerN);
                            params[imageName]["visible"] = 0;
                            console.log(`${imageName} OFF`);
                        } // change params["imageName"]["visible"] to save visibility state
                        else {
                            papaya.Container.showImage(0, layerN)
                            params[imageName]["visible"] = 1;
                            console.log(`${imageName} ON`);
                        }
                    }, // onChange
                }, // on event
            }, // switch
            {
                view: "combo",
                id: "colorCBox",
                label: "Color",
                inputWidth: 300,
                options: papayaColorTables,
                value: imageValues["lut"],
                on: {
                    onChange: function (newv, oldv) {
                        layerN = parseInt($$("layerCBox").getInputNode().value); // Obtain current layer int from layerCBox
                        let myViewer = papayaContainers[0].viewer;
                        papayaContainers[0].viewer.screenVolumes[layerN].changeColorTable(myViewer, newv);
                        params[params['imageNames'][layerN]]["lut"] = newv; // save new value to params
                    }, // onChange
                }, // on event
            }, // combobox
            {
                view: "counter",
                id: "alphaCounter",
                label: "Alpha",
                inputWidth: 300,
                min: 0,
                max: 1,
                step: 0.05,
                value: imageValues["alpha"],
                on: {
                    onChange: function (newv, oldv) {
                        layerN = parseInt($$("layerCBox").getInputNode().value); // Obtain current layer int from layerCBox
                        papayaContainers[0].viewer.screenVolumes[layerN].alpha = newv;
                        papayaContainers[0].viewer.drawViewer(true, false);
                        params[params['imageNames'][layerN]]["alpha"] = newv; // save new value to params
                    }, // onChange
                }, // on event
            }, // counter
            {
                view: "counter",
                id: "minCounter",
                label: "Min",
                inputWidth: 300,
                min: 0,
                max: 10000,
                step: 0.05,
                value: imageValues["min"],
                on: {
                    onChange: function (newv, oldv) {
                        layerN = parseInt($$("layerCBox").getInputNode().value); // Obtain current layer int from layerCBox
                        papayaContainers[0].viewer.screenVolumes[layerN].screenMin = newv;
                        papayaContainers[0].viewer.drawViewer(true, false);
                        params[params['imageNames'][layerN]]["min"] = newv; // save new value to params
                    }, // onChange
                }, // on event
            }, // counter
            {
                view: "counter",
                id: "maxCounter",
                label: "Max",
                inputWidth: 300,
                min: 0,
                max: 10000,
                step: 0.05,
                value: imageValues["max"],
                on: {
                    onChange: function (newv, oldv) {
                        layerN = parseInt($$("layerCBox").getInputNode().value); // Obtain current layer int from layerCBox
                        papayaContainers[0].viewer.screenVolumes[layerN].screenMax = newv;
                        papayaContainers[0].viewer.drawViewer(true, false);
                        params[params['imageNames'][layerN]]["max"] = newv; // save new value to params
                    }, // onChange
                }, // on event
            }, // counter
            {
                view: "button",
                id: "swapViewsButton",
                inputWidth: 300,
                value: "Swap Views",
                click: function () {
                    papayaContainers[0].viewer.rotateViews()
                }
            }
            // papayaContainers[0].viewer.goToInitialCoordinate() // resets coordinate marker
            // papayaContainers[0].viewer.currentCoord // outputs marker coordinates
            // papayaContainers[0].viewer.cursorPosition // outputs mouse coordinates
            // papayaContainers[0].viewer.currentScreenVolume // Gives current layer info
            // papayaContainers[0].viewer.setZoomFactor(2) // Zoom in
            // papayaContainers[0].viewer.getZoomString() // how much image is zoomed
        ], // Rows
    };

    // Merge Panels into Layout
    var layout = {
        cols: [leftPanel, {
            view: "resizer"
        }, middlePanel, {
            view: "resizer"
        }, rightPanel]
    };

    console.log("Done: setupPanels");
    return (layout);
};