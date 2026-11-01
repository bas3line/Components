/** How `npm run shots` photographs a demo for the README. */
export type Shot = {
  /**
   * Leave it out for the still frame: the page loads with reduced motion, so
   * every component shows its finished state. Set it to let the motion play
   * and wait this many milliseconds before the picture.
   */
  wait?: number;
};
