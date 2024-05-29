import { KeyCode, Manipulator, KarabinerRules, LayerCommand } from "./types";
import { rectangle, app, open, shell } from "./utils";

type HyperKeySublayer = {
  // The ? is necessary, otherwise we'd have to define something for _every_ key code
  [key_code in KeyCode]?: LayerCommand;
};

const HYPER_KEY: KarabinerRules = {
  description: "Hyper Key (⌃⌥⇧⌘)",
  manipulators: [
    {
      description: "Caps Lock -> Hyper Key",
      from: {
        key_code: "caps_lock",
        modifiers: {
          optional: ["any"],
        },
      },
      to: [
        {
          set_variable: {
            name: "hyper",
            value: 1,
          },
        },
      ],
      to_after_key_up: [
        {
          set_variable: {
            name: "hyper",
            value: 0,
          },
        },
      ],
      to_if_alone: [
        {
          key_code: "escape",
        },
      ],
      type: "basic",
    },
  ],
};

function generateSubLayerVariableName(key: KeyCode) {
  return `hyper_sublayer_${key}`;
}
/**
 * Create a Hyper Key sublayer, where every command is prefixed with a key
 * e.g. Hyper + O ("Open") is the "open applications" layer, I can press
 * e.g. Hyper + O + G ("Google Chrome") to open Chrome
 */
function createHyperSubLayer(
  sublayer_key: KeyCode,
  commands: HyperKeySublayer,
  allSubLayerVariables: string[]
): Manipulator[] {
  const subLayerVariableName = generateSubLayerVariableName(sublayer_key);

  return [
    // When Hyper + sublayer_key is pressed, set the variable to 1; on key_up, set it to 0 again
    {
      description: `Toggle Hyper sublayer ${sublayer_key}`,
      type: "basic",
      from: {
        key_code: sublayer_key,
        modifiers: {
          optional: ["any"],
        },
      },
      to_after_key_up: [
        {
          set_variable: {
            name: subLayerVariableName,
            // The default value of a variable is 0: https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/conditions/variable/
            // That means by using 0 and 1 we can filter for "0" in the conditions below and it'll work on startup
            value: 0,
          },
        },
      ],
      to: [
        {
          set_variable: {
            name: subLayerVariableName,
            value: 1,
          },
        },
      ],
      // This enables us to press other sublayer keys in the current sublayer
      // (e.g. Hyper + O > M even though Hyper + M is also a sublayer)
      // basically, only trigger a sublayer if no other sublayer is active
      conditions: [
        ...allSubLayerVariables
          .filter(
            (subLayerVariable) => subLayerVariable !== subLayerVariableName
          )
          .map((subLayerVariable) => ({
            type: "variable_if" as const,
            name: subLayerVariable,
            value: 0,
          })),
        {
          type: "variable_if",
          name: "hyper",
          value: 1,
        },
      ],
    },
    // Define the individual commands that are meant to trigger in the sublayer
    ...(Object.keys(commands) as (keyof typeof commands)[]).map(
      (command_key): Manipulator => ({
        ...commands[command_key],
        type: "basic" as const,
        from: {
          key_code: command_key,
          modifiers: {
            optional: ["any"],
          },
        },
        // Only trigger this command if the variable is 1 (i.e., if Hyper + sublayer is held)
        conditions: [
          {
            type: "variable_if",
            name: subLayerVariableName,
            value: 1,
          },
        ],
      })
    ),
  ];
}

/**
 * Create all hyper sublayers. This needs to be a single function, as well need to
 * have all the hyper variable names in order to filter them and make sure only one
 * activates at a time
 */
function createHyperSubLayers(subLayers: {
  [key_code in KeyCode]?: HyperKeySublayer | LayerCommand;
}): KarabinerRules[] {
  const allSubLayerVariables = (
    Object.keys(subLayers) as (keyof typeof subLayers)[]
  ).map((sublayer_key) => generateSubLayerVariableName(sublayer_key));

  return Object.entries(subLayers).map(([key, value]) =>
    "to" in value
      ? {
          description: `Hyper Key + ${key}`,
          manipulators: [
            {
              ...value,
              type: "basic" as const,
              from: {
                key_code: key as KeyCode,
                modifiers: {
                  optional: ["any"],
                },
              },
              conditions: [
                {
                  type: "variable_if",
                  name: "hyper",
                  value: 1,
                },
                ...allSubLayerVariables.map((subLayerVariable) => ({
                  type: "variable_if" as const,
                  name: subLayerVariable,
                  value: 0,
                })),
              ],
            },
          ],
        }
      : {
          description: `Hyper Key sublayer "${key}"`,
          manipulators: createHyperSubLayer(
            key as KeyCode,
            value,
            allSubLayerVariables
          ),
        }
  );
}

export function createHyperKeyRules(): KarabinerRules[] {
  return [
    HYPER_KEY,
    ...createHyperSubLayers({
      // spacebar: open(
      // "raycast://extensions/stellate/mxstbr-commands/create-notion-todo"
      // ),
      // b = "B"rowse
      b: {
        y: open("https://youtube.com"),
        f: open("https://facebook.com"),
        r: open("https://reddit.com"),
      },
      // e = "opEn" applications
      e: {
        k: app("Google Chrome"),
        u: app("Microsoft Outlook"),
        n: app("Skype"),
        f: app("Finder"),
        j: app("/Applications/Alacritty"),
        b: app("Messenger"),
        p: app("IntelliJ IDEA Ultimate"),
        m: app("Webex"),
      },

      // w = "Window" via rectangle.app
      w: {
        semicolon: {
          description: "Window: Hide",
          to: [
            {
              key_code: "h",
              modifiers: ["right_command"],
            },
          ],
        },
        y: rectangle("previous-display"),
        o: rectangle("next-display"),
        k: rectangle("top-half"),
        j: rectangle("bottom-half"),
        h: rectangle("left-half"),
        l: rectangle("right-half"),
        f: rectangle("maximize"),
        u: {
          description: "Window: Previous Tab",
          to: [
            {
              key_code: "tab",
              modifiers: ["right_control", "right_shift"],
            },
          ],
        },
        i: {
          description: "Window: Next Tab",
          to: [
            {
              key_code: "tab",
              modifiers: ["right_control"],
            },
          ],
        },
        n: {
          description: "Window: Next Window",
          to: [
            {
              key_code: "grave_accent_and_tilde",
              modifiers: ["right_command"],
            },
          ],
        },

        // moving window back and forth
        // b: {
        // description: "Window: Back",
        // to: [
        // {
        // key_code: "open_bracket",
        // modifiers: ["right_command"],
        // },
        // ],
        // },
        // m: {
        // description: "Window: Forward",
        // to: [
        // {
        // key_code: "close_bracket",
        // modifiers: ["right_command"],
        // },
        // ],
        // },

        // require CatchMouse to be installed, so that moving mouse to other screen works
        // and set ctrl + cmd + p/o to move the mouse
        close_bracket: {
          description: "Move mouse to the right screen",
          to: [
            {
              key_code: "p",
              modifiers: ["right_control", "right_command"],
            },
          ],
        },
        open_bracket: {
          description: "Move mouse to the right screen",
          to: [
            {
              key_code: "o",
              modifiers: ["right_control", "right_command"],
            },
          ],
        },
      },

      // s = "System"
      s: {
        // open preference
        c: open("x-apple.systempreferences:com.apple.preference"),

        // start recording screen using quicktime player
        r: shell`osacript ~/.yadr/osascripts/record.scpt`,

        // caPture the screen
        u: {
          description: "Capture the screen",
          to: [
            {
              key_code: "4",
              modifiers: ["right_shift", "right_command"],
            },
          ],
        },
      },

      // iterm manipulation
      r: {
        // open and focus
        i: app("/Applications/iTerm2"),
        k: shell`pkill -f "/Applications/iTerm2.app"`,
        // quickly select and execute frequently using command on the opening iterm2
        y: shell`~/.yadr/bin/iterm2 ycmd`,
        m: shell`~/.yadr/bin/iterm2 ~/.yadr/bin/rofi-beats`,
        n: shell`~/.yadr/bin/iterm2 ~/.yadr/bin/app-launch`,
        u: shell`~/.yadr/bin/iterm2 ~/.yadr/bin/command-launch`,
      },
    }),
  ];
}
