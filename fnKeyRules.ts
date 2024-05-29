import { Manipulator, KeyCode, KarabinerRules } from "./types";

function createFnKeyMap(from: KeyCode, to: KeyCode): Manipulator {
  return {
    from: {
      key_code: from,
      modifiers: {
        mandatory: ["option"],
        optional: ["any"],
      },
    },
    to: [
      {
        key_code: to,
      },
    ],
    type: "basic",
  };
}

export function createFnKeyMaps(): KarabinerRules {
  return {
    description: "Change fn+hjkl to arrow keys",
    manipulators: [
      createFnKeyMap("h", "left_arrow"),
      createFnKeyMap("j", "down_arrow"),
      createFnKeyMap("k", "up_arrow"),
      createFnKeyMap("l", "right_arrow"),
    ],
  };
}
