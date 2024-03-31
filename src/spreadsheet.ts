// データが格納されているシートのヘッダー情報
export const columnHeader = ['date', 'message', 'user_id'] as const
type ColumnHeader = typeof columnHeader[number]
// ヘッダーの情報と列数のマッピング
type ColumnHeaderIndexMap = Record<ColumnHeader, number>
// 定義されているヘッダー情報と一致するか
const isColumnHeader = (item: string): item is ColumnHeader => {
  return columnHeader.some((type) => type === item)
}
/**
 * シートのヘッダーの列数情報を取得
 * NOTE: どのヘッダーが何列目にあるのかを取得する
 * @param sheet
 */
export const getColumnIndexMap = (
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): ColumnHeaderIndexMap => {
  const headerValues: string[] = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]

  // 列数情報を作成
  return headerValues.reduce<ColumnHeaderIndexMap>((acc, item, index) => {
    if (isColumnHeader(item)) {
      acc[item] = index
    }
    return acc
  }, {} as ColumnHeaderIndexMap)
}
// シート1行分の情報
export type Row = string[]
