export const backspace = (str: string) => {
  const selectedText = window.getSelection()!.toString();

    if (selectedText) {
      return str.replace(selectedText, '');
    }

    const specialChars = ['\\', '^', ' ', '_'];
    const indexToSlice = specialChars.reduce((acc, char) => {
      const index = str.slice(0, -1).lastIndexOf(char);
      return index > acc ? index : acc;
    }, 0);

    return str.slice(0, indexToSlice);
}