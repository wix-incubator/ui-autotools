export function dedent(str: string) {

  let size = -1;

  return str.replace(/\n(\s+)/g, (_m, m1) => {

      if (size < 0) {
          size = m1.replace(/\t/g, '    ').length;
      }

      return '\n' + m1.slice(Math.min(m1.length, size));
  });
}
