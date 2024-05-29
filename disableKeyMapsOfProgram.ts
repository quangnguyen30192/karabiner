import { KarabinerRules, From } from "./types";

function disableKeyMapOnProgram(
  description: string,
  appIdentifier: string,
  from: From
): KarabinerRules {
  return {
    description,
    manipulators: [
      {
        conditions: [
          {
            bundle_identifiers: [appIdentifier],
            type: "frontmost_application_if",
          },
        ],
        type: "basic",
        from,
        to: [{ key_code: "f11" }],
      },
    ],
  };
}

export function createDisableKeyMapOnPrograms(): KarabinerRules[] {
  return [
    disableKeyMapOnProgram(
      "Disable (Map to F11 which is harmless) Cmd-Q for Google Chrome due to frequently accidentally press",
      "^com\\.google\\.Chrome$",
      { key_code: "w", modifiers: { mandatory: ["command", "left_shift"] } }
    ),
    disableKeyMapOnProgram(
      "Disable (Map to F11 which is harmless) Cmd-Q for Google Chrome due to frequently accidentally press",
      "^com\\.google\\.Chrome$",
      { key_code: "Q", modifiers: { mandatory: ["command"] } }
    ),
    disableKeyMapOnProgram(
      "Disable (Map to F11 which is harmless) Cmd-Q for Terminal Emulator due to frequently accidentally press",
      "^io\\.Alarcritty$",
      { key_code: "Q", modifiers: { mandatory: ["command"] } }
    ),
  ];
}
