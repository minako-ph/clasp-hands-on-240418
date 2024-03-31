const prop = PropertiesService.getScriptProperties().getProperties()
const CHANEL_ACCESS_TOKEN = prop.CHANEL_ACCESS_TOKEN

export type Message = {
  type: string
  text: string
}

/**
 * リプライメッセージを送信する
 * @param replyToken
 * @param messages
 */
export const sendReplyMessage = (replyToken: string, messages: Message[]) => {
  const ENDPOINT_URL = 'https://api.line.me/v2/bot/message/reply'
  const options = {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: 'Bearer ' + CHANEL_ACCESS_TOKEN,
    },
    method: 'post',
    payload: JSON.stringify({
      replyToken: replyToken,
      messages: messages,
    }),
  }
  // @ts-ignore
  return UrlFetchApp.fetch(ENDPOINT_URL, options)
}

/**
 * プッシュメッセージを送信する
 * @param to
 * @param messages
 */
export const sendPushMessage = (to: string, messages: Message[]) => {
  const ENDPOINT_URL = 'https://api.line.me/v2/bot/message/push'
  const options = {
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      Authorization: 'Bearer ' + CHANEL_ACCESS_TOKEN,
    },
    method: 'post',
    payload: JSON.stringify({
      to: to,
      messages: messages,
    }),
  }
  // @ts-ignore
  return UrlFetchApp.fetch(ENDPOINT_URL, options)
}
