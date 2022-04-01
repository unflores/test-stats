
import * as logger from '../../logger'
import CsvWriter from 'objects-to-csv'
import * as ciClient from '../CiClient'
import { filterSpecifiedStages, transformBuildToRuntime, isRuntimeOutlier } from './list'

export async function calculateRuntimes() {
  const masterBuilds = await ciClient.fetchMasterBuilds()

  const stagePromises = masterBuilds.map(build => ciClient.fetchBuildStages(build.number))
  const buildsStages = await Promise.all(stagePromises)
  const runtimes
    = buildsStages.map(filterSpecifiedStages)
      .map(transformBuildToRuntime(masterBuilds))
      .filter(isRuntimeOutlier)

  const writer = new CsvWriter(runtimes)
  await writer.toDisk('./runtimes.csv')
  logger.info("Runtimes written to csv")
}
