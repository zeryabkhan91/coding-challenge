
function getSimilarElementsForSelectedElement(el: HTMLElement): HTMLElement[] {
  let parent = el.parentElement;
  let selectors = [];
  while (parent) {
    const parentSelector = getElementSelector(parent);

    selectors.unshift(parentSelector);
    parent = parent.parentElement;
  }

  selectors.push(getElementSelector(el));

  const path = selectors.join(' ');

  const similarNodes = el.ownerDocument.querySelectorAll(path);

  const similarElements: HTMLElement[] = [];

  similarNodes.forEach((node) => similarElements.push(node as HTMLElement));

  return similarElements;
}

function getElementSelector(el: HTMLElement): string {
  const classSelector = el.classList.value
    .replace('isSelected', '')
    .replace('isPredicted', '')
    .replace('isHighlighted', '')
    .trim()
    .replaceAll(/\s+/g, '.')

  const selector = el.nodeName + (classSelector.length ? '.' : '') + classSelector;

  return selector;
}

function predictedElementsForSelected(selectedElements: Set<HTMLElement>): HTMLElement[] {
  const similarElements = [...selectedElements.values()].map(el => getSimilarElementsForSelectedElement(el));
  const predictedElements = new Set(similarElements.flat());

  for (const el of selectedElements) {
    predictedElements.delete(el);
  }

  return Array.from(predictedElements);
}


export {
  getElementSelector,
  predictedElementsForSelected,
  getSimilarElementsForSelectedElement,
}