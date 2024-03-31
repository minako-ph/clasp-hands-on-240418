import { doPost, main, remind } from './main'

declare const global: {
  [x: string]: unknown
}

global.main = main
global.doPost = doPost
global.remind = remind
