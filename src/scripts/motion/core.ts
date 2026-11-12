import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };

/** Motion tokens: jediné místo, kde se ladí "pocit" webu. */
export const ease = {
  reveal: 'power4.out',
  soft: 'power2.out',
  scrub: 'none',
};

export const dur = {
  micro: 0.3,
  reveal: 1.1,
};
