import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"

import { getEventInfo } from "../../../libs/getEventInfo"
import { BigCheckBox } from "../parts/BigCheckBox"

import styles from "./IntegrateStartGG.module.scss"

export const IntegrateStartGG: FC = () => {
  const { register, getValues } = useFormContext()
  const [info, setInfo] = useState<{ type: string; message: string }>({
    type: "",
    message: "",
  })
  const key = "integrateStartGG.enabled"
  const textKey = "integrateStartGG.url"
  return (
    <div className={styles.container}>
      <BigCheckBox name={key} className="mr-[15px]" />
      <div className={styles.text}>
        <label htmlFor={key}>
          <h4>start.ggと連携する</h4>
          <p>
            start.ggと連携することで配信代の情報やTop8の情報をstart.ggから取得できます。
            <br />
            Grand
            Finalsが含まれているトーナメント表のページのURLを入力してください。
          </p>
        </label>
        <input
          type="text"
          {...register(textKey, {
            validate: async (value) => {
              if (!getValues("integrateStartGG.enabled")) return true
              const url = getValues("integrateStartGG.url")
              if (!url) return "URLを入力してください。"
              if (!url.startsWith("https://www.start.gg/tournament/")) {
                return "トーナメントのURLが正しくありません。"
              }
              const urlParts = url.split("/")
              if (urlParts.length < 10) {
                return "トーナメントのURLが正しくありません。"
              }
              return true
            },
          })}
          onBlur={async () => {
            const url = getValues("integrateStartGG.url")
            const eventInfo = await getEventInfo(url)
            console.log({ eventInfo })
            if (!eventInfo) {
              setInfo({
                type: "error",
                message: "トーナメントのURLが正しくありません。",
              })
              return
            }
            setInfo({
              type: "success",
              message: `「${eventInfo.tournamentName} ${eventInfo.eventName}」の情報を取得します。`,
            })
          }}
          placeholder="https://www.start.gg/tournament/competition/event/singles/brackets/000000/000000"
        />
        <p
          className={`absolute ${
            info.type === "error"
              ? "text-[color:var(--bb-attention)]"
              : "text-[color:var(--bb-success)]"
          }`}
        >
          {info.message}
        </p>
      </div>
    </div>
  )
}
