function isDifferent(object1: any, object2: any): boolean {
  return JSON.stringify(object1) !== JSON.stringify(object2);
}

export function getThing(): number {
  let counter = 0;
  window.addEventListener = () => {
    counter++;
  };
  window.removeEventListener = () => {
    counter--;
  };

  return counter;
}
