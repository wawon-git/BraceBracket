import { ScoreboardColorsMap, Setting } from "../libs/const"
import { genUseDatabaseValue } from "./useDatabaseValue"

const defaultValue: Setting = {
  scoreboard: {
    design: {
      layout: "Dual",
      color: ScoreboardColorsMap["Dual"][0].filename,
    },
    cameraAndLogo: {
      displayCameraAndTwitterID: false,
      useLogo: false,
      dropShadow: "none",
    },
  },
}

export const useSetting = genUseDatabaseValue<Setting>(
  (id) => `tournaments/${id}/setting`,
  defaultValue
)
