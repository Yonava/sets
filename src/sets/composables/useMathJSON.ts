import { computed, type Ref } from 'vue';
import {ALPHABET } from '../other/constants';
import { ComputeEngine } from '@cortex-js/compute-engine';
import { LATEX_SET_SYMBOLS } from '../other/constants';

/*

*/
const createComputeEngine = () => {
    const computeEngine = new ComputeEngine();

  // make sure that all upper case chars and Omega are treated as sets in the compute engine
  // otherwise might not interpret correctly and throw error even for correct syntax
  
  for (const letter of ALPHABET) {
    computeEngine.declare(letter, "set");
  }
  computeEngine.declare(LATEX_SET_SYMBOLS.OMEGA, "set");
  return computeEngine;
}

export const useMathJSON = (latexString: Ref<string>) => {
    const computeEngine = createComputeEngine();

    return computed(() => {
        return computeEngine.parse(latexString.value);
    });
}