import { columnHeader, getColumnIndexMap, Row } from './spreadsheet'
import { Message, sendPushMessage, sendReplyMessage } from './line'

export const main = () => {
  console.log('🐛 debug : テスト')
}

/**
 * WebhookからのPOSTリクエストを処理する
 * @param e
 */
export const doPost = (e: any) => {
  const EVENTS = JSON.parse(e.postData.contents).events
  for (const event of EVENTS) {
    execute(event)
  }
}

/**
 * イベントを処理する
 * @param event
 */
const execute = (event: any) => {
  const EVENT_TYPE = event.type
  const REPLY_TOKEN = event.replyToken
  const USER_ID = event.source.userId

  if (EVENT_TYPE === 'message') {
    if (event.message.type === 'text') {
      const text = event.message.text
      // 「登録」で始まるメッセージの場合、リマインドメッセージを登録する
      const matchResult = text.match(/^登録/)
      if (matchResult && matchResult.input === text) {
        add(text, REPLY_TOKEN, USER_ID)
      } else {
        sendError(REPLY_TOKEN)
      }
    }
  }
}

/**
 * リマインドメッセージをスプレッドシートに登録する
 */
const add = (text: string, replyToken: string, userId: string): void => {
  // 登録 <日付(月/日)> <メッセージ>の形式であることを確認する
  const reg = /^登録 (\d{1,2}\/\d{1,2}) (.+)$/
  const validate = reg.test(text)
  if (!validate) {
    sendError(replyToken)
    return
  }
  const match = text.match(reg)
  // 日付を取得
  const dateStr = match?.[1] ?? ''
  const date = new Date(dateStr)
  // 有効な日付であることを確認する, 空文字もここで弾けるはず
  if (isNaN(date.getTime())) {
    sendError(replyToken)
    return
  }
  // スプレッドシートを開く
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = activeSpreadsheet.getSheetByName('シート1')
  if (!sheet) {
    throw new Error('sheet not found')
  }

  // 列のインデックスを取得
  const columnIndexMap = getColumnIndexMap(sheet)
  // 新しい行を作成して書き込む
  const newRow: Row = Array.from({ length: columnHeader.length }, () => '')
  newRow[columnIndexMap.date] = dateStr
  newRow[columnIndexMap.message] = match?.[2] ?? ''
  newRow[columnIndexMap.user_id] = userId
  sheet.appendRow(newRow)
}

/**
 * リマインドメッセージを送信する
 * @param replyToken
 */
const sendError = (replyToken: string): void => {
  const messages = [
    {
      type: 'text',
      text: '登録 <日付(月/日)> <メッセージ>の形式で入力してください',
    },
  ]
  sendReplyMessage(replyToken, messages)
}

/**
 * リマインドメッセージを送信する
 */
export const remind = () => {
  // スプレッドシートを開く
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = activeSpreadsheet.getSheetByName('シート1')
  if (!sheet) {
    throw new Error('sheet not found')
  }

  // 列のインデックスを取得
  const columnIndexMap = getColumnIndexMap(sheet)

  // 今日の日付を取得
  const today = new Date()
  const todayMonth = today.getMonth() + 1
  const todayDate = today.getDate()

  // データを取得して、今日の日付のデータを抽出する
  const rows = sheet.getDataRange().getValues()
  type UserId = string
  // ユーザーごとにメッセージをまとめる
  const userMessagesMap = rows.reduce<Record<UserId, Message[]>>(
    (acc: Record<UserId, Message[]>, row: Row) => {
      const rowDate = row[columnIndexMap.date]
      const rowDateObj = new Date(rowDate)
      // 今日の日付のデータの場合、メッセージを格納する
      if (
        rowDateObj.getMonth() + 1 === todayMonth &&
        rowDateObj.getDate() === todayDate
      ) {
        // 既に同じユーザーに対するメッセージの配列がある場合、メッセージを追加する
        if (acc[row[columnIndexMap.user_id]]) {
          acc[row[columnIndexMap.user_id]].push({
            type: 'text',
            text: row[columnIndexMap.message],
          })
        } else {
          // まだ同じユーザーに対するメッセージの配列がない場合、新しくメッセージの配列を作成する
          acc[row[columnIndexMap.user_id]] = [
            {
              type: 'text',
              text: row[columnIndexMap.message],
            },
          ]
        }
      }
      return acc
    },
    {} as Record<UserId, Message[]>
  )

  // ユーザーごとにメッセージを送信する
  for (const userId in userMessagesMap) {
    const messages = userMessagesMap[userId]
    sendPushMessage(userId, messages)
  }
}
