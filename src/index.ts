import * as cheerio from "cheerio";
function getNodeType(tag: string): AllNodeTypes {
  switch (tag) {
    case "h1":
      return "heading-1";

    case "h2":
      return "heading-2";

    case "h3":
      return "heading-3";

    case "h4":
      return "heading-4";

    case "h5":
      return "heading-5";

    case "h6":
      return "heading-6";

    case "p":
    case "div":
      return "paragraph";

    case "ul":
      return "unordered-list";

    case "ol":
      return "ordered-list";

    case "li":
      return "list-item";

    case "a":
      return "hyperlink";

    case "span":
    case "b":
    case "i":
    case null:
      return "text";
    default:
      return "text";
  }
}
function isHeaderType(type: AllNodeTypes): boolean {
  switch (type) {
    case "heading-1":
    case "heading-2":
    case "heading-3":
    case "heading-4":
    case "heading-5":
    case "heading-6":
      return true;
    default:
      return false;
  }
}

function isListType(type: AllNodeTypes): boolean {
  switch (type) {
    case "ordered-list":
    case "unordered-list":
      return true;
    default:
      return false;
  }
}
function isNodeType(type: AllNodeTypes): boolean {
  switch (type) {
    case "paragraph":
    case "unordered-list":
    case "ordered-list":
    case "list-item":
      return true;
    default:
      return false;
  }
}
function generateHyperlink(
  root: RootContentfulNode,
  node: CheerioElement,
  parentNode: ContentContentfulNode,
  parentMarks?: ContentfulMark[],
) {
  const nextMark = parentMarks ? [...parentMarks] : [];
  const httpNode = new ContentContentfulNode("hyperlink");
  httpNode.content.push(
    ...generateDataForSubnodes(root, node.children, parentNode, nextMark),
  );
  httpNode.data = new UriData(node.attribs.href);
  return httpNode;
}
function getMarksFromNode(node: CheerioElement): ContentfulMark[] {
  const marks: ContentfulMark[] = [];
  switch (node.tagName) {
    case "b":
      marks.push(new ContentfulMark("bold"));
      break;
    case "i":
      marks.push(new ContentfulMark("italic"));
      break;
    case "u":
      marks.push(new ContentfulMark("italic"));
      break;
    case "code":
      marks.push(new ContentfulMark("code"));
      break;
  }
  return marks;
}
function generateDataForSubnodes(
  root: RootContentfulNode,
  nodes: CheerioElement[],
  parentNode: ContentContentfulNode,
  parentMarks?: ContentfulMark[],
): BaseContentfulNode[] {
  const leafNodes: BaseContentfulNode[] = [];
  nodes.forEach((node) => {
    const nextMark = parentMarks ? [...parentMarks] : [];
    const type = getNodeType(node.tagName);
    nextMark.push(...getMarksFromNode(node));
    if (type === "text" && !isListType(parentNode.nodeType)) {
      if (node.tagName) {
        leafNodes.push(
          ...generateDataForSubnodes(root, node.children, parentNode, nextMark),
        );
      } else {
        const leafNode = new LeafContentfulNode(node.data || "");
        leafNode.marks = nextMark;
        leafNodes.push(leafNode);
      }
    } else if (type === "hyperlink") {
      leafNodes.push(generateHyperlink(root, node, parentNode, nextMark));
    } else if (type === "list-item") {
      const listItem = new ContentContentfulNode("list-item");
      node.children.forEach((nodeChild) => {
        generateDataForNode(listItem, nodeChild);
      });

      leafNodes.push(listItem);
    } else {
      generateDataForNode(root, node);
    }
  });
  return leafNodes;
}
function generateDataForNode(root: RootContentfulNode, node: CheerioElement) {
  const nodeType: AllNodeTypes = getNodeType(node.tagName);
  let cfNode = null;
  if (isHeaderType(nodeType) || nodeType === "paragraph") {
    cfNode = new ContentContentfulNode(nodeType as HeaderTypes);
    cfNode.content.push(
      ...generateDataForSubnodes(root, node.children, cfNode),
    );
  } else if (isListType(nodeType)) {
    cfNode = new ContentContentfulNode(nodeType as HeaderTypes);
    cfNode.content.push(
      ...generateDataForSubnodes(root, node.children, cfNode),
    );
  } else if (nodeType === "text") {
    cfNode = new ContentContentfulNode("paragraph");
    if (!node.tagName) {
      cfNode.content.push(new LeafContentfulNode(node.data || ""));
    } else {
      cfNode.content.push(
        ...generateDataForSubnodes(root, node.children, cfNode),
      );
    }
  } else if (nodeType === "hyperlink") {
    cfNode = new ContentContentfulNode("paragraph");
    cfNode.content.push(generateHyperlink(root, node, cfNode));
  }

  if (cfNode) { root.content.push(cfNode); }
  return cfNode;
}
export type RootType = "document";
export type MainTypes = "paragraph" | HeaderTypes | ListTypes | "hr"; // spacer
export type HeaderTypes =
  | "heading-1"
  | "heading-2"
  | "heading-3"
  | "heading-4"
  | "heading-5"
  | "heading-6";
export type ListTypes = "ordered-list" | "unordered-list";
export type NodeTypes =
  | "paragraph"
  | "ordered-list"
  | "unordered-list"
  | "list-item"
  | "hyperlink";
export type AllNodeTypes = NodeTypes | MainTypes | RootType | LeafType;
export type LeafType = "text";
export abstract class BaseContentfulNode {
  public data: BaseData;
  constructor(public nodeType: AllNodeTypes = "paragraph") {
    this.data = new BaseData();
  }
}
export class ContentContentfulNode extends BaseContentfulNode {
  public content: BaseContentfulNode[] = [];
  constructor(public nodeType: NodeTypes | MainTypes | RootType = "paragraph") {
    super(nodeType);
  }
}
export class RootContentfulNode extends ContentContentfulNode {
  constructor() {
    super("document");
  }
}
export class LeafContentfulNode extends BaseContentfulNode {
  public marks: ContentfulMark[] = [];
  constructor(public value: string, public nodeType: LeafType = "text") {
    super(nodeType);
  }
  public addMark(mark: MarkTypes): void {
    this.marks.push(new ContentfulMark(mark));
  }
}
export class BaseData {}
export class UriData extends BaseData {
  constructor(public uri: string = "") {
    super();
  }
}
export type MarkTypes = "underline" | "bold" | "italic" | "code";
export class ContentfulMark {
  constructor(public type: MarkTypes = "bold") {}
}
export function generateRichText(html: string) {
  const document = cheerio.parseHTML(html);
  const rich = new RootContentfulNode();
  document.forEach((doc) => {
    generateDataForNode(rich, (doc as unknown) as CheerioElement);
  });
  return rich;
}
