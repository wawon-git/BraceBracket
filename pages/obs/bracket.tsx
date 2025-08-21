import {
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceString,
  useViewModelInstanceNumber,
} from "@rive-app/react-webgl2"
import Head from "next/head"
import { useRouter } from "next/router"
import { FC, useState } from "react"
import { useAsync, useInterval } from "react-use"

import { useLoadBracket } from "../../hooks/useLoadBracket"
import { useSetting } from "../../hooks/useSetting"
import { BracketScore, Bracket as BracketType } from "../../libs/const"
import { getNameAndTeamtag } from "../../libs/utils"

const query = `
query PhaseGroupSets($phaseGroupId: ID!) {
  phaseGroup(id: $phaseGroupId) {
    id
    displayIdentifier
    sets(
      sortType: MAGIC
    ){
      pageInfo{
        total
      }
      nodes{
        fullRoundText
        slots{
          entrant{
            name
          }
          standing {
            placement
            stats {
              score {
                value
              }
            }
          }
        }
      }
    }
  }
}
`
type Data = {
  data: {
    phaseGroup: {
      displayIdentifier: string
      id: number
      sets: {
        nodes: {
          fullRoundText: string
          slots: {
            entrant: {
              name: string | null
            } | null
            standing: {
              placement: number
              stats: {
                score: {
                  value: number
                } | null
              } | null
            } | null
          }[]
        }[]
      }
    }
  }
}
const getMaxLosersRound = (res: Data) => {
  const nodes = res.data.phaseGroup.sets.nodes
  return nodes
    .map((n) => n.fullRoundText)
    .filter((n) => n.includes("Losers Round"))
    .sort()
    .reverse()[0]
}
const fullRoundText2Keys: { [key: string]: keyof BracketType } = {
  "Grand Final Reset": "grandFinalReset",
  "Grand Final": "grandFinal",
  "Winners Final": "winnersFinal",
  "Winners Semi-Final": "winnersSemiFinal",
  "Losers Final": "losersFinal",
  "Losers Semi-Final": "losersSemiFinal",
  "Losers Quarter-Final": "losersQuarterFinal",
}

const loadTop8Bracket = async (phaseGroupId: string) => {
  const res = (await fetch("https://api.smash.gg/gql/alpha", {
    method: "POST",
    headers: {
      Authorization: "Bearer 2d1a68f32b1baf8b2b25aae5569f9dca",
      "content-Type": "application/json",
      Accept: "application/json",
      encoding: "utf-8",
    },
    body: JSON.stringify({
      query,
      variables: { phaseGroupId: phaseGroupId },
    }),
  }).then((res) => res.json())) as Data
  const maxLosersRound = getMaxLosersRound(res)
  const rounds = [
    // "Grand Final Reset",
    "Grand Final",
    "Winners Final",
    "Winners Semi-Final",
    "Losers Final",
    "Losers Semi-Final",
    "Losers Quarter-Final",
    maxLosersRound,
  ]
  const tmp: { [key: string]: string } = {}
  tmp[maxLosersRound] = "losersRound"
  const rounds2Key = Object.assign(tmp, fullRoundText2Keys)
  const bracket: BracketType = {
    grandFinal: [],
    grandFinalReset: [],
    losersFinal: [],
    losersQuarterFinal: [],
    losersRound: [],
    losersSemiFinal: [],
    winnersFinal: [],
    winnersSemiFinal: [],
  }
  res.data.phaseGroup.sets.nodes.forEach((n) => {
    if (!rounds.includes(n.fullRoundText)) return
    const key = rounds2Key[n.fullRoundText]
    const players = n.slots.map((s) => {
      const { team, name } = getNameAndTeamtag(s?.entrant?.name)
      return {
        team: team,
        name: name,
        score: s?.standing?.stats?.score?.value,
      }
    })
    const score: BracketScore = {
      player1: {
        team: players[0]?.team,
        name: players[0]?.name,
        score: players[0]?.score,
      },
      player2: {
        team: players[1]?.team,
        name: players[1]?.name,
        score: players[1]?.score,
      },
    }
    bracket[key].push(score)
  })
  return bracket
}

export const Bracket: FC = () => {
  const router = useRouter()
  const id = router.query.id as string
  const [loadBracket, , loadingLoadBracket] = useLoadBracket(id)
  const [setting, , loadingSetting] = useSetting(id)
  const [lastLoadedAt, setLastLoadedAt] = useState(0)
  const [bracket, setBracket] = useState<BracketType>({
    grandFinalReset: [],
    grandFinal: [],
    winnersFinal: [],
    winnersSemiFinal: [],
    losersFinal: [],
    losersSemiFinal: [],
    losersQuarterFinal: [],
    losersRound: [],
  })

  const { rive, RiveComponent } = useRive({
    src: "/graphics/umebura-scoreboard.riv",
    artboard: "umeburaBracket",
    stateMachines: "State Machine 1",
    autoBind: true,
    autoplay: true,
  })
  const viewModel = useViewModel(rive, { name: "bracket" })
  const defaultBound = useViewModelInstance(viewModel, { rive })

  // Grand Final Reset
  const { value: grandFinalResetP1Name, setValue: setGrandFinalResetP1Name } =
    useViewModelInstanceString("grandFinalReset/p1/name", defaultBound)
  setGrandFinalResetP1Name(bracket.grandFinalReset[0]?.player1?.name || "")

  const { value: grandFinalResetP1Score, setValue: setGrandFinalResetP1Score } =
    useViewModelInstanceNumber("grandFinalReset/p1/score", defaultBound)
  setGrandFinalResetP1Score(bracket.grandFinalReset[0]?.player1?.score || 0)

  const { value: grandFinalResetP2Name, setValue: setGrandFinalResetP2Name } =
    useViewModelInstanceString("grandFinalReset/p2/name", defaultBound)
  setGrandFinalResetP2Name(bracket.grandFinalReset[0]?.player2?.name || "")

  const { value: grandFinalResetP2Score, setValue: setGrandFinalResetP2Score } =
    useViewModelInstanceNumber("grandFinalReset/p2/score", defaultBound)
  setGrandFinalResetP2Score(bracket.grandFinalReset[0]?.player2?.score || 0)

  // Grand Final
  const { value: grandFinalP1Name, setValue: setGrandFinalP1Name } =
    useViewModelInstanceString("grandFinal/p1/name", defaultBound)
  setGrandFinalP1Name(bracket.grandFinal[0]?.player1?.name || "")

  const { value: grandFinalP1Score, setValue: setGrandFinalP1Score } =
    useViewModelInstanceNumber("grandFinal/p1/score", defaultBound)
  setGrandFinalP1Score(bracket.grandFinal[0]?.player1?.score || 0)

  const { value: grandFinalP2Name, setValue: setGrandFinalP2Name } =
    useViewModelInstanceString("grandFinal/p2/name", defaultBound)
  setGrandFinalP2Name(bracket.grandFinal[0]?.player2?.name || "")

  const { value: grandFinalP2Score, setValue: setGrandFinalP2Score } =
    useViewModelInstanceNumber("grandFinal/p2/score", defaultBound)
  setGrandFinalP2Score(bracket.grandFinal[0]?.player2?.score || 0)

  // Winners Final
  const { value: winnersFinalP1Name, setValue: setWinnersFinalP1Name } =
    useViewModelInstanceString("winnersFinal/p1/name", defaultBound)
  setWinnersFinalP1Name(bracket.winnersFinal[0]?.player1?.name || "")

  const { value: winnersFinalP1Score, setValue: setWinnersFinalP1Score } =
    useViewModelInstanceNumber("winnersFinal/p1/score", defaultBound)
  setWinnersFinalP1Score(bracket.winnersFinal[0]?.player1?.score || 0)

  const { value: winnersFinalP2Name, setValue: setWinnersFinalP2Name } =
    useViewModelInstanceString("winnersFinal/p2/name", defaultBound)
  setWinnersFinalP2Name(bracket.winnersFinal[0]?.player2?.name || "")

  const { value: winnersFinalP2Score, setValue: setWinnersFinalP2Score } =
    useViewModelInstanceNumber("winnersFinal/p2/score", defaultBound)
  setWinnersFinalP2Score(bracket.winnersFinal[0]?.player2?.score || 0)

  // Winners Semi Final 1
  const {
    value: winnersSemiFinal1P1Name,
    setValue: setWinnersSemiFinal1P1Name,
  } = useViewModelInstanceString("winnersSemiFinal1/p1/name", defaultBound)
  setWinnersSemiFinal1P1Name(bracket.winnersSemiFinal[0]?.player1?.name || "")

  const {
    value: winnersSemiFinal1P1Score,
    setValue: setWinnersSemiFinal1P1Score,
  } = useViewModelInstanceNumber("winnersSemiFinal1/p1/score", defaultBound)
  setWinnersSemiFinal1P1Score(bracket.winnersSemiFinal[0]?.player1?.score || 0)

  const {
    value: winnersSemiFinal1P2Name,
    setValue: setWinnersSemiFinal1P2Name,
  } = useViewModelInstanceString("winnersSemiFinal1/p2/name", defaultBound)
  setWinnersSemiFinal1P2Name(bracket.winnersSemiFinal[0]?.player2?.name || "")

  const {
    value: winnersSemiFinal1P2Score,
    setValue: setWinnersSemiFinal1P2Score,
  } = useViewModelInstanceNumber("winnersSemiFinal1/p2/score", defaultBound)
  setWinnersSemiFinal1P2Score(bracket.winnersSemiFinal[0]?.player2?.score || 0)

  // Winners Semi Final 2
  const {
    value: winnersSemiFinal2P1Name,
    setValue: setWinnersSemiFinal2P1Name,
  } = useViewModelInstanceString("winnersSemiFinal2/p1/name", defaultBound)
  setWinnersSemiFinal2P1Name(bracket.winnersSemiFinal[1]?.player1?.name || "")

  const {
    value: winnersSemiFinal2P1Score,
    setValue: setWinnersSemiFinal2P1Score,
  } = useViewModelInstanceNumber("winnersSemiFinal2/p1/score", defaultBound)
  setWinnersSemiFinal2P1Score(bracket.winnersSemiFinal[1]?.player1?.score || 0)

  const {
    value: winnersSemiFinal2P2Name,
    setValue: setWinnersSemiFinal2P2Name,
  } = useViewModelInstanceString("winnersSemiFinal2/p2/name", defaultBound)
  setWinnersSemiFinal2P2Name(bracket.winnersSemiFinal[1]?.player2?.name || "")

  const {
    value: winnersSemiFinal2P2Score,
    setValue: setWinnersSemiFinal2P2Score,
  } = useViewModelInstanceNumber("winnersSemiFinal2/p2/score", defaultBound)
  setWinnersSemiFinal2P2Score(bracket.winnersSemiFinal[1]?.player2?.score || 0)

  // Losers Final
  const { value: losersFinalP1Name, setValue: setLosersFinalP1Name } =
    useViewModelInstanceString("losersFinal/p1/name", defaultBound)
  setLosersFinalP1Name(bracket.losersFinal[0]?.player1?.name || "")

  const { value: losersFinalP1Score, setValue: setLosersFinalP1Score } =
    useViewModelInstanceNumber("losersFinal/p1/score", defaultBound)
  setLosersFinalP1Score(bracket.losersFinal[0]?.player1?.score || 0)

  const { value: losersFinalP2Name, setValue: setLosersFinalP2Name } =
    useViewModelInstanceString("losersFinal/p2/name", defaultBound)
  setLosersFinalP2Name(bracket.losersFinal[0]?.player2?.name || "")

  const { value: losersFinalP2Score, setValue: setLosersFinalP2Score } =
    useViewModelInstanceNumber("losersFinal/p2/score", defaultBound)
  setLosersFinalP2Score(bracket.losersFinal[0]?.player2?.score || 0)

  // Losers Semi Final
  const { value: losersSemiFinalP1Name, setValue: setLosersSemiFinalP1Name } =
    useViewModelInstanceString("losersSemiFinal/p1/name", defaultBound)
  setLosersSemiFinalP1Name(bracket.losersSemiFinal[0]?.player1?.name || "")

  const { value: losersSemiFinalP1Score, setValue: setLosersSemiFinalP1Score } =
    useViewModelInstanceNumber("losersSemiFinal/p1/score", defaultBound)
  setLosersSemiFinalP1Score(bracket.losersSemiFinal[0]?.player1?.score || 0)

  const { value: losersSemiFinalP2Name, setValue: setLosersSemiFinalP2Name } =
    useViewModelInstanceString("losersSemiFinal/p2/name", defaultBound)
  setLosersSemiFinalP2Name(bracket.losersSemiFinal[0]?.player2?.name || "")

  const { value: losersSemiFinalP2Score, setValue: setLosersSemiFinalP2Score } =
    useViewModelInstanceNumber("losersSemiFinal/p2/score", defaultBound)
  setLosersSemiFinalP2Score(bracket.losersSemiFinal[0]?.player2?.score || 0)

  // Losers Quarter Final 1
  const {
    value: losersQuarterFinal1P1Name,
    setValue: setLosersQuarterFinal1P1Name,
  } = useViewModelInstanceString("losersQuarterFinal1/p1/name", defaultBound)
  setLosersQuarterFinal1P1Name(
    bracket.losersQuarterFinal[0]?.player1?.name || ""
  )

  const {
    value: losersQuarterFinal1P1Score,
    setValue: setLosersQuarterFinal1P1Score,
  } = useViewModelInstanceNumber("losersQuarterFinal1/p1/score", defaultBound)
  setLosersQuarterFinal1P1Score(
    bracket.losersQuarterFinal[0]?.player1?.score || 0
  )

  const {
    value: losersQuarterFinal1P2Name,
    setValue: setLosersQuarterFinal1P2Name,
  } = useViewModelInstanceString("losersQuarterFinal1/p2/name", defaultBound)
  setLosersQuarterFinal1P2Name(
    bracket.losersQuarterFinal[0]?.player2?.name || ""
  )

  const {
    value: losersQuarterFinal1P2Score,
    setValue: setLosersQuarterFinal1P2Score,
  } = useViewModelInstanceNumber("losersQuarterFinal1/p2/score", defaultBound)
  setLosersQuarterFinal1P2Score(
    bracket.losersQuarterFinal[0]?.player2?.score || 0
  )

  // Losers Quarter Final 2
  const {
    value: losersQuarterFinal2P1Name,
    setValue: setLosersQuarterFinal2P1Name,
  } = useViewModelInstanceString("losersQuarterFinal2/p1/name", defaultBound)
  setLosersQuarterFinal2P1Name(
    bracket.losersQuarterFinal[1]?.player1?.name || ""
  )

  const {
    value: losersQuarterFinal2P1Score,
    setValue: setLosersQuarterFinal2P1Score,
  } = useViewModelInstanceNumber("losersQuarterFinal2/p1/score", defaultBound)
  setLosersQuarterFinal2P1Score(
    bracket.losersQuarterFinal[1]?.player1?.score || 0
  )

  const {
    value: losersQuarterFinal2P2Name,
    setValue: setLosersQuarterFinal2P2Name,
  } = useViewModelInstanceString("losersQuarterFinal2/p2/name", defaultBound)
  setLosersQuarterFinal2P2Name(
    bracket.losersQuarterFinal[1]?.player2?.name || ""
  )

  const {
    value: losersQuarterFinal2P2Score,
    setValue: setLosersQuarterFinal2P2Score,
  } = useViewModelInstanceNumber("losersQuarterFinal2/p2/score", defaultBound)
  setLosersQuarterFinal2P2Score(
    bracket.losersQuarterFinal[1]?.player2?.score || 0
  )

  // Losers Round 1
  const { value: losersRound1P1Name, setValue: setLosersRound1P1Name } =
    useViewModelInstanceString("losersRound1/p1/name", defaultBound)
  setLosersRound1P1Name(bracket.losersRound[0]?.player1?.name || "")

  const { value: losersRound1P1Score, setValue: setLosersRound1P1Score } =
    useViewModelInstanceNumber("losersRound1/p1/score", defaultBound)
  setLosersRound1P1Score(bracket.losersRound[0]?.player1?.score || 0)

  const { value: losersRound1P2Name, setValue: setLosersRound1P2Name } =
    useViewModelInstanceString("losersRound1/p2/name", defaultBound)
  setLosersRound1P2Name(bracket.losersRound[0]?.player2?.name || "")

  const { value: losersRound1P2Score, setValue: setLosersRound1P2Score } =
    useViewModelInstanceNumber("losersRound1/p2/score", defaultBound)
  setLosersRound1P2Score(bracket.losersRound[0]?.player2?.score || 0)

  // Losers Round 2
  const { value: losersRound2P1Name, setValue: setLosersRound2P1Name } =
    useViewModelInstanceString("losersRound2/p1/name", defaultBound)
  setLosersRound2P1Name(bracket.losersRound[1]?.player1?.name || "")

  const { value: losersRound2P1Score, setValue: setLosersRound2P1Score } =
    useViewModelInstanceNumber("losersRound2/p1/score", defaultBound)
  setLosersRound2P1Score(bracket.losersRound[1]?.player1?.score || 0)

  const { value: losersRound2P2Name, setValue: setLosersRound2P2Name } =
    useViewModelInstanceString("losersRound2/p2/name", defaultBound)
  setLosersRound2P2Name(bracket.losersRound[1]?.player2?.name || "")

  const { value: losersRound2P2Score, setValue: setLosersRound2P2Score } =
    useViewModelInstanceNumber("losersRound2/p2/score", defaultBound)
  setLosersRound2P2Score(bracket.losersRound[1]?.player2?.score || 0)

  useAsync(async () => {
    console.log({ setting, loadBracket })
    if (!setting?.integrateStartGG.enabled || !loadBracket) return
    if (loadBracket.lastRequestedAt <= lastLoadedAt) return

    if (lastLoadedAt === 0) {
      setLastLoadedAt(loadBracket.lastRequestedAt)
      return
    }
    const phaseGroupId = setting?.integrateStartGG.url.split("/").pop()
    if (!phaseGroupId) return
    const bracket = await loadTop8Bracket(phaseGroupId)

    setBracket(bracket)
    setLastLoadedAt(new Date().valueOf())
  }, [loadBracket, lastLoadedAt, setting])

  useInterval(
    async () => {
      const phaseGroupId = setting?.integrateStartGG.url.split("/").pop()
      if (!phaseGroupId) return
      const bracket = await loadTop8Bracket(phaseGroupId)
      setBracket(bracket)
      setLastLoadedAt(new Date().valueOf())
    },
    setting?.integrateStartGG.enabled && loadBracket?.autoUpdate ? 10000 : null
  )

  if (!setting || loadingSetting || !loadBracket || loadingLoadBracket)
    return null

  return (
    <>
      <Head>
        <title>BraceBracket | Bracket Layout</title>
      </Head>
      <div style={{ width: 1920, height: 1080 }}>
        <RiveComponent
          width={1920}
          height={1080}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      {/* 従来のBracketコンポーネント（一旦削除せずに残す） */}
      {/* <div className="relative">
        <Body setting={setting} bracket={bracket} />
      </div> */}
    </>
  )
}

export default Bracket
