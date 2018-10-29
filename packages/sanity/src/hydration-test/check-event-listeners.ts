function isDifferent(object1: any, object2: any): boolean {
  return JSON.stringify(object1) !== JSON.stringify(object2);
}

export function getThing(document: any, window: any): (document: any, window: any) => boolean {
  const oldDocumentListeners = window.getEventListeners(document);
  console.log('oldDocumentListeners', oldDocumentListeners);
  const oldWindowListeners = window.getEventListeners(window);
  console.log('oldWindowListeners', oldWindowListeners);

  return function checkAgain(_document: any, _window: any): boolean {
    const currentDocumentListeners = window.getEventListeners(_document);
    const currentWindowListeners = window.getEventListeners(_window);
    const documentChanged = isDifferent(oldDocumentListeners, currentDocumentListeners);
    const windowChanged = isDifferent(oldWindowListeners, currentWindowListeners);

    return documentChanged || windowChanged;
  };
}
