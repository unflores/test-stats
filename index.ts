
import 'dotenv/config'
import * as logger from './logger'
import { calculateRuntimes, DroneException } from './src/Builds'

calculateRuntimes().catch((reason: DroneException) => {
  logger.error(reason)
})
