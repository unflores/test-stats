import * as util from 'util'

const infoOptions = { showHidden: false, depth: null, colors: true }

export function error(message?: any) {
  console.error(message)
}

export function debug(message?: any) {
  console.debug(message)
}

export function log(message?: any) {
  console.log(message)
}

export function info(message?: any) {
  console.log(util.inspect(message, infoOptions))
}
