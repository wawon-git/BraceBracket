import {
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceString,
  useViewModelInstanceNumber,
} from "@rive-app/react-webgl2"
import Head from "next/head"
import { useRouter } from "next/router"

import { useScore } from "../../hooks/useScore"
import { useSetting } from "../../hooks/useSetting"

import type { NextPage } from "next"

const Layout: NextPage = () => {
  const router = useRouter()
  const id = router.query.id as string
  const [setting, , loadingSetting] = useSetting(id)
  const [score, , loadingScore] = useScore(id)
  // const obs = router.query.obs as string
  // const [currentScene, _, sceneList] = useSceneChanger(id, obs === "on")

  const { rive, RiveComponent } = useRive({
    src: "/graphics/umebura-scoreboard.riv",
    artboard: "umeburaScoreboard",
    stateMachines: "umeburaScoreboardState",
    autoBind: true,
    autoplay: true,
  })
  const viewModel = useViewModel(rive, { name: "score" })
  const defaultBound = useViewModelInstance(viewModel, { rive })

  const { value: p1Name, setValue: setP1Name } = useViewModelInstanceString(
    "p1/playerName", // Property path
    defaultBound
  )
  setP1Name(score?.p1.playerName || "")

  const { value: p1TwitterID, setValue: setP1TwitterID } =
    useViewModelInstanceString(
      "p1/twitterID", // Property path
      defaultBound
    )
  setP1TwitterID(score?.p1.twitterID || "@")

  const { value: p1Score, setValue: setP1Score } = useViewModelInstanceNumber(
    "p1/score", // Property path
    defaultBound
  )
  setP1Score(score?.p1.score || 0)

  const { value: p2Name, setValue: setP2Name } = useViewModelInstanceString(
    "p2/playerName", // Property path
    defaultBound
  )
  setP2Name(score?.p2.playerName || "")

  const { value: p2TwitterID, setValue: setP2TwitterID } =
    useViewModelInstanceString(
      "p2/twitterID", // Property path
      defaultBound
    )
  setP2TwitterID(score?.p2.twitterID || "@")

  const { value: p2Score, setValue: setP2Score } = useViewModelInstanceNumber(
    "p2/score", // Property path
    defaultBound
  )
  setP2Score(score?.p2.score || 0)

  const { value: round, setValue: setRound } = useViewModelInstanceString(
    "round", // Property path
    defaultBound
  )
  setRound(score?.round || "pools")

  if (!setting || loadingSetting || !score || loadingScore) return null
  return (
    <>
      <Head>
        <title>BraceBracket | Score Layout</title>
      </Head>
      {/* 親要素に明示的なサイズを与え，canvas には 100% でフィットさせる */}
      <div style={{ width: 1920, height: 1080 }}>
        <RiveComponent
          width={1920}
          height={1080}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </>
  )
}

export default Layout
