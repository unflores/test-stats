import * as util from 'util'

const infoOptions = { showHidden: false, depth: null, colors: true }

export function error(message?: any, ...optionalParams: any[]) {
  console.error(message, optionalParams)
}

export function debug(message?: any, ...optionalParams: any[]) {
  console.debug(message, optionalParams)
}

export function log(message?: any, ...optionalParams: any[]) {
  console.log(message, optionalParams)
}

export function info(message?: any, ...optionalParams: any[]) {
  console.log(util.inspect(message, infoOptions), optionalParams)
}
