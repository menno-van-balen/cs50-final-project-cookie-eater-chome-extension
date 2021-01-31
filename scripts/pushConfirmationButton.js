// Declare global variables
let found = false;
let seen = [];

console.log("start search");

// Get all nodes that contains the word "cookies"
const nodes = getNodes(`html/body//*[(contains(text(), 'cookies'))]`);
console.log(nodes);

// Search from these nodes' parrents, till max 2 levels up
const levelsUp = 3;
for (let i = 0; i < nodes.length && !found; i++) {
  searchButtonfromParrents(nodes[i], levelsUp);
}

// console.log(seen);
console.log("end search");

// /* Helper functions */

// Function getnodes returns an array with HTML elements specified by a xpath query
function getNodes(xpath) {
  const nodes = document.evaluate(
    xpath,
    document,
    null,
    XPathResult.ANY_TYPE,
    null
  );

  let nodesArray = [];

  while ((node = nodes.iterateNext())) {
    nodesArray.push(node);
  }

  return nodesArray;
}

// searchButtonfromParrents cales function searchButonInchildren,
// params: node = startnode, levels = how many levels up to go up.
function searchButtonfromParrents(node, levels) {
  for (let i = 0; i < levels && !found; i++) {
    // No searching in these HTML elements:
    if (node.parentNode.nodeName !== "BODY") node = node.parentNode;

    if (
      node.nodeName === "BODY" ||
      node.nodeName === "HEADER" ||
      node.nodeName === "NAV" ||
      node.nodeName === "FOOTER" ||
      node.nodeName === "STYLE" ||
      node.nodeName === "SCRIPT"
    ) {
      break;
    }

    // Search in parrents children
    searchButonInchildren(node);
  }
}

// searchButonInchildren Finds button or link in child nodes
function searchButonInchildren(node) {
  // Base cases:
  // Return if found
  if (found) {
    console.log("found return");
    return;
  }

  // Return if a button or link is found
  if (node.nodeName == "BUTTON" || node.nodeName == "A") {
    console.log("a button found:");
    console.log(node);
    const innerText = node.innerText;
    const ariaLabel = node.getAttribute("aria-label");

    // Only click the button if it is o.k.
    const attributeRegex = /dismiss|close|cc|consent/i;
    const okRegex = /\bok\b|\b\s*×\s*\b|\bx\b|\bakkoord\b|\baccepteren\b|\balles\b|\byes\b|\bagree\b|\baccept\b|\bconcordo\b|\baceito\b/i;

    if (okRegex.test(innerText) || attributeRegex.test(ariaLabel)) {
      console.log(innerText, " | ", ariaLabel);
      console.log("ok to click");
      found = true;
      node.click();
    }
    return;
  }

  // keep track of visited nodes
  seen.push(node);

  // Search further in children if there are any
  if (node.childNodes) {
    const children = node.childNodes;
    children.forEach((node) => {
      if (!seen.includes(node)) searchButonInchildren(node);
    });
  }
}
