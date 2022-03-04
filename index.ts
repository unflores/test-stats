
import 'dotenv/config'
import * as logger from './logger'
import { DroneException } from './src/types'
import { calculateRuntimes } from './src/Builds'

calculateRuntimes().catch((reason: DroneException) => {
  logger.error(reason)
})
