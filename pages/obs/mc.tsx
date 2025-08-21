import {
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceString,
  useViewModelInstanceNumber,
} from "@rive-app/react-webgl2"
import { NextPage } from "next"
import Head from "next/head"
import { useRouter } from "next/router"

import { useMC } from "../../hooks/useMC"
import { useSetting } from "../../hooks/useSetting"

const Page: NextPage = () => {
  const router = useRouter()
  const id = router.query.id as string
  const [setting, , loadingSetting] = useSetting(id)
  const [mc, , loadingMC] = useMC(id)

  const { rive, RiveComponent } = useRive({
    src: "/graphics/umebura-scoreboard.riv",
    artboard: "umeburaMc",
    stateMachines: "State Machine 1",
    autoBind: true,
    autoplay: true,
  })
  const viewModel = useViewModel(rive, { name: "mc" })
  const defaultBound = useViewModelInstance(viewModel, { rive })
  console.log("defaultBound", defaultBound)

  // MC data binding
  const filteredMCList =
    mc?.mcList?.filter((m) => {
      return m.playerName || m.team || m.twitterID
    }) || []

  // MC1のデータバインディング
  const { value: mc1Name, setValue: setMC1Name } = useViewModelInstanceString(
    "mc1/playerName",
    defaultBound
  )
  setMC1Name(filteredMCList[0]?.playerName || "")

  const { value: mc1Team, setValue: setMC1Team } = useViewModelInstanceString(
    "mc1/team",
    defaultBound
  )
  setMC1Team(filteredMCList[0]?.team || "")

  const { value: mc1TwitterID, setValue: setMC1TwitterID } =
    useViewModelInstanceString("mc1/twitterID", defaultBound)
  setMC1TwitterID(filteredMCList[0]?.twitterID || "")

  // MC2のデータバインディング
  const { value: mc2Name, setValue: setMC2Name } = useViewModelInstanceString(
    "mc2/playerName",
    defaultBound
  )
  setMC2Name(filteredMCList[1]?.playerName || "")

  const { value: mc2Team, setValue: setMC2Team } = useViewModelInstanceString(
    "mc2/team",
    defaultBound
  )
  setMC2Team(filteredMCList[1]?.team || "")

  const { value: mc2TwitterID, setValue: setMC2TwitterID } =
    useViewModelInstanceString("mc2/twitterID", defaultBound)
  setMC2TwitterID(filteredMCList[1]?.twitterID || "")

  // MC3のデータバインディング
  const { value: mc3Name, setValue: setMC3Name } = useViewModelInstanceString(
    "mc3/playerName",
    defaultBound
  )
  setMC3Name(filteredMCList[2]?.playerName || "")

  const { value: mc3Team, setValue: setMC3Team } = useViewModelInstanceString(
    "mc3/team",
    defaultBound
  )
  setMC3Team(filteredMCList[2]?.team || "")

  const { value: mc3TwitterID, setValue: setMC3TwitterID } =
    useViewModelInstanceString("mc3/twitterID", defaultBound)
  setMC3TwitterID(filteredMCList[2]?.twitterID || "")

  // MC4のデータバインディング
  const { value: mc4Name, setValue: setMC4Name } = useViewModelInstanceString(
    "mc4/playerName",
    defaultBound
  )
  setMC4Name(filteredMCList[3]?.playerName || "")

  const { value: mc4Team, setValue: setMC4Team } = useViewModelInstanceString(
    "mc4/team",
    defaultBound
  )
  setMC4Team(filteredMCList[3]?.team || "")

  const { value: mc4TwitterID, setValue: setMC4TwitterID } =
    useViewModelInstanceString("mc4/twitterID", defaultBound)
  setMC4TwitterID(filteredMCList[3]?.twitterID || "")

  // MCの人数を設定
  const { value: mcCount, setValue: setMCCount } = useViewModelInstanceNumber(
    "mcCount",
    defaultBound
  )
  setMCCount(filteredMCList.length)

  if (!setting || loadingSetting || !mc || loadingMC) {
    return null
  }

  return (
    <>
      <Head>
        <title>BraceBracket | Title Layout</title>
      </Head>
      <div style={{ width: 1920, height: 1080 }}>
        <RiveComponent
          width={1920}
          height={1080}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      {/* 従来のMCコンポーネント（一旦削除せずに残す） */}
      {/* <MC setting={setting} mc={mc} /> */}
    </>
  )
}

export default Page
