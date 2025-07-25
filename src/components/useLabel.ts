import type { Circle } from '@/types/types';
import type { Ref } from 'vue';

const RESERVED = ['S', 'O', 'C', 'D', 'I', 'U']
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter((l) => !RESERVED.includes(l))

/**
 * takes a list of labelled items and a sequence of labels and returns a function that will
 * return the next available label in the sequence that is not already in the list of labelled items
 *
 * @param labelledItems - a list of labelled items used to check for existing labels
 * @param sequence - a sequence of labels to use when generating new labels
 * @returns a function that will return the next available label
 * @example const labelGetter = graphLabelGetter(graph.nodes, LETTERS);
 *  const newLabel = labelGetter();
 *  console.log(newLabel); // 'A'
 *  // add "A" to the list of labelled items
 *  console.log(newLabel); // 'B'
 *  // remove "A" from the list of labelled items
 *  console.log(newLabel); // 'A'
 */
export const useLabelGetter = (labelledItems: Ref<Circle[]>, sequence = LETTERS) => () => {
  let labels = labelledItems.value.map((c) => c.label);

  let timesAround = 0;
  let index = 0;
  let newLabel;

  const getPrefix = () => {
    if (timesAround === 0) return '';
    return sequence[(timesAround - 1) % sequence.length];
  };

  while (!newLabel) {
    const indexOutOfBounds = index >= sequence.length;
    if (indexOutOfBounds) {
      labels = labels.slice(sequence.length);
      index = 0;
      timesAround++;
    }
    const potentialLabel = getPrefix() + sequence[index];
    const labelExists = labels.includes(potentialLabel);
    if (!labelExists) newLabel = potentialLabel;
    index++;
  }

  return newLabel;
};
