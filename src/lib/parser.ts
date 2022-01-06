import { Container, Sprite } from "pixi.js";
import parse from 'xml-parser'

interface IAttributes {
    texture?: string,
    cellHeight?: number,
    cellWidth?: number,
    cols?: number,
    rows?: number,
}

interface INode {
    attributes: IAttributes;
    children: INode[]
}

const nodeAtrributeBehaviorMap = {
    pivotX: function (display, attribute) { display.pivot.x = attribute },
    x: function (display, attribute) { display.x = attribute }
}

let _assetsMap;
export const initParser = (assetsMap) => {
    _assetsMap = assetsMap;
}

const convert = (attributes, data) => {
    for (const key in attributes) {
        let element: string = attributes[key];
        if (element.startsWith('{') && element.endsWith('}')) {
            element = element.split(/{|}/).filter(Boolean)[0];
            attributes[key] = data[element]
        }
    }
}

const createGrid = (xmlRoot: INode, data) => {
    const gridContainer = new Container;
    convert(xmlRoot.attributes, data);
    const { cellHeight, cellWidth, cols, rows } = xmlRoot.attributes;
    const cell = xmlRoot.children[0];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cellContainer = createNode(cell);
            gridContainer.addChild(cellContainer);
            const x = cellWidth * col;
            const y = cellHeight * row;
            cellContainer.position.set(x, y);
        }
    }
    for (const key in xmlRoot.attributes) {
        const val = xmlRoot.attributes[key];
        nodeAtrributeBehaviorMap[key] &&
            nodeAtrributeBehaviorMap[key](gridContainer, val)
    }
    // console.log('create grid result', gridContainer);
    return gridContainer;
}

const createNode = (nodeXML: INode) => {
    if (nodeXML.children.length > 0) {
        const rootView = new Container;
        nodeXML.children.forEach(
            childXML => {
                rootView.addChild(createNode(childXML))
            }
        )
        return rootView
    }

    let leefView: Sprite
    if (nodeXML.attributes.texture)
        leefView = Sprite.from(_assetsMap[nodeXML.attributes.texture]);
    else
        leefView = new Sprite;

    for (const key in nodeXML.attributes) {
        const val = nodeXML.attributes[key];
        nodeAtrributeBehaviorMap[key] &&
            nodeAtrributeBehaviorMap[key](leefView, val)
    }
    return leefView
}

export const parseXML = (xml: any, data: any) => {
    xml = xml || `<Root></Root>`;
    xml = parse(xml);
    console.warn(xml);

    if (xml.root.name == 'Grid') {
        return createGrid(xml.root, data);
    }
    return createNode(xml.root);
}

