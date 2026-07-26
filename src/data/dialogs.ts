export interface DialogChoice {
  label: string;
  /** Node id to jump to; omit (or empty) to end the conversation. */
  goto?: string;
}

export interface DialogNode {
  text: string;
  /** If present, shown after the text finishes typing. */
  choices?: DialogChoice[];
  /** Linear next node when there are no choices; omit to end. */
  goto?: string;
}

export type DialogTree = Record<string, DialogNode>;

/** Keyed by the `dialog` field on each NPC. Every tree starts at 'start'. */
export const DIALOGS: Record<string, DialogTree> = {
  rix: {
    start: {
      text: 'New face in the Grid? You picked a bad decade to show up.',
      choices: [
        { label: 'Ask about the district', goto: 'district' },
        { label: 'Ask about work', goto: 'work' },
        { label: 'Leave' },
      ],
    },
    district: {
      text: 'Corp towers up north, gangs run the undercity. Down here we pour drinks and mind the cams.',
      goto: 'start',
    },
    work: {
      text: "Talk to Vex out on the street. She always needs someone stupid enough to run a package.",
      goto: 'start',
    },
  },

  vex: {
    start: {
      text: "You're standing in my spot, choom. That takes guts or stupidity.",
      choices: [
        { label: '"I\'m looking for work."', goto: 'work' },
        { label: '"Sorry, I\'ll move."', goto: 'backoff' },
        { label: 'Say nothing', goto: 'stare' },
      ],
    },
    work: {
      text: "Maybe. Run a package to the netrunner down the block. Don't open it. We'll see.",
    },
    backoff: {
      text: 'Smart. The Grid eats the bold first.',
    },
    stare: {
      text: "...I like you. Or I'll gut you. Come back when you've grown a spine.",
    },
  },

  glitch: {
    start: {
      text: "You feel that? The whole block's humming. Someone's sniffing the traffic.",
      choices: [
        { label: '"Is it dangerous?"', goto: 'danger' },
        { label: '"Can you help me?"', goto: 'help' },
        { label: 'Leave' },
      ],
    },
    danger: {
      text: "Everything's dangerous if you're cheap about your ICE. Stay off the open nodes.",
      goto: 'start',
    },
    help: {
      text: 'Bring me something worth trading and maybe. Vex has been sitting on a hot package.',
      goto: 'start',
    },
  },
};
