import { Conditions, KeyCode, Manipulator, To } from "./types";
const SPEED_MULTIPLIER = 1.2;
const WHEEL_SPEED = 50;
const SLOWER_SPEED = 300;
const NORMAl_SPEED = 718;
const FASTER_SPEED = 2536;
const ENABLE_MOUSE_MODE_KEY: KeyCode = "right_shift";
const ENABLE_FASTER_MODE_KEY: KeyCode = "slash";
const ENABLE_SLOWER_MODE_KEY: KeyCode = "right_control";

const MOVE_FASTER_KEYS_SETVAR: Manipulator = {
  from: {
    key_code: ENABLE_FASTER_MODE_KEY,
    modifiers: {
      mandatory: [ENABLE_MOUSE_MODE_KEY],
      optional: ["any"],
    },
  },
  to: [
    {
      set_variable: {
        name: "mouse_faster_move_speed",
        value: 1,
      },
    },
  ],
  to_after_key_up: [
    {
      set_variable: {
        name: "mouse_faster_move_speed",
        value: 0,
      },
    },
  ],
  type: "basic",
};

const MOVE_SLOWER_KEYS_SETVAR: Manipulator = {
  from: {
    key_code: ENABLE_SLOWER_MODE_KEY,
    modifiers: {
      mandatory: [ENABLE_MOUSE_MODE_KEY],
      optional: ["any"],
    },
  },
  to: [
    {
      set_variable: {
        name: "mouse_slower_move_speed",
        value: 1,
      },
    },
  ],
  to_after_key_up: [
    {
      set_variable: {
        name: "mouse_slower_move_speed",
        value: 0,
      },
    },
  ],
  type: "basic",
};

const MOVE_SLOWER: Conditions[] = [
  {
    name: "mouse_slower_move_speed",
    type: "variable_if",
    value: 1,
  },
];

const MOVE_FASTER: Conditions[] = [
  {
    name: "mouse_faster_move_speed",
    type: "variable_if",
    value: 1,
  },
];

function mouseKey(
  conditions: Conditions[],
  key: KeyCode,
  to: To[],
): Manipulator {
  return {
    conditions,
    from: {
      key_code: key,
      modifiers: {
        mandatory: [ENABLE_MOUSE_MODE_KEY],
        optional: ["any"],
      },
    },
    to,
    type: "basic",
  };
}

function verticalMove(y: number): To[] {
  return [{ mouse_key: { speed_multiplier: SPEED_MULTIPLIER, y } }];
}

function horizotalMove(x: number): To[] {
  return [{ mouse_key: { speed_multiplier: SPEED_MULTIPLIER, x } }];
}

function verticalWheel(speed: number): To[] {
  return [
    {
      mouse_key: { speed_multiplier: SPEED_MULTIPLIER, vertical_wheel: speed },
    },
  ];
}

function horizontalWheel(speed: number): To[] {
  return [
    {
      mouse_key: {
        speed_multiplier: SPEED_MULTIPLIER,
        horizontal_wheel: speed,
      },
    },
  ];
}

function leftClick(): To[] {
  return [{ pointing_button: "button1" }];
}

function rightClick(): To[] {
  return [{ pointing_button: "button2" }];
}

export function createMouseKeyRules() {
  return {
    description: "Mouse keys",
    manipulators: [
      MOVE_FASTER_KEYS_SETVAR,
      MOVE_SLOWER_KEYS_SETVAR,

      // set arrow keys
      mouseKey(MOVE_SLOWER, "w", verticalMove(-SLOWER_SPEED)),
      mouseKey(MOVE_FASTER, "w", verticalMove(-FASTER_SPEED)),
      mouseKey([], "w", verticalMove(-NORMAl_SPEED)),

      mouseKey(MOVE_SLOWER, "a", horizotalMove(-SLOWER_SPEED)),
      mouseKey(MOVE_FASTER, "a", horizotalMove(-FASTER_SPEED)),
      mouseKey([], "a", horizotalMove(-NORMAl_SPEED)),

      mouseKey(MOVE_SLOWER, "s", verticalMove(SLOWER_SPEED)),
      mouseKey(MOVE_FASTER, "s", verticalMove(FASTER_SPEED)),
      mouseKey([], "s", verticalMove(NORMAl_SPEED)),

      mouseKey(MOVE_SLOWER, "d", horizotalMove(SLOWER_SPEED)),
      mouseKey(MOVE_FASTER, "d", horizotalMove(FASTER_SPEED)),
      mouseKey([], "d", horizotalMove(NORMAl_SPEED)),

      // set left/right click
      mouseKey([], "q", leftClick()),
      mouseKey([], "e", rightClick()),

      // scroll up/down left/right
      mouseKey([], "c", verticalWheel(-WHEEL_SPEED)),
      mouseKey([], "x", verticalWheel(WHEEL_SPEED)),

      mouseKey([], "z", horizontalWheel(WHEEL_SPEED)),
      mouseKey([], "v", horizontalWheel(-WHEEL_SPEED)),
    ],
  };
}
