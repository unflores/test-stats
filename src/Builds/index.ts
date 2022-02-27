
import * as logger from '../../logger'
import CsvWriter from 'objects-to-csv'
import { DroneBuildStage, DroneBuild } from '../types'
import * as ciClient from '../CiClient'

// We use this number as a build id for failed builds
const BUILD_ERROR = -1
// Any runtime over 1000 minutes will be seen as having failed
// even if it completes successfully
const RUNTIME_THRESHOLD = 300

type Runtime = {
  buildNumber: number,
  timeInMinutes: number
}

// Returns all stages that match the stage names we are timing
function filterSpecifiedStages(stages: Array<DroneBuildStage>): Array<DroneBuildStage> {
  return stages.filter(stage => stage.name.search(new RegExp(process.env.STAGE_NAMES_REGEX)) != -1)
}

function transformBuildToRuntime(masterBuilds: Array<DroneBuild>) {
  return (stages: Array<DroneBuildStage>): Runtime => {
    // Some stages don't have build ids. I could probably filter out those stages as invalid earlier on, maybe the build itself should be considered invalid...
    //
    try {
      return {
        buildNumber: masterBuilds.find(masterBuild => masterBuild.id == stages[0].build_id).number,
        timeInMinutes: stages.map(stage => stage.stopped - stage.started)
          .reduce((partialSum, current) => partialSum + current, 0) / 60
      }
    } catch (err) {
      logger.debug(err)

      return {
        buildNumber: BUILD_ERROR,
        timeInMinutes: 0
      }
    }
  }
}

function removeOutliers(runtime: Runtime): Boolean {
  return runtime.buildNumber !== BUILD_ERROR && runtime.timeInMinutes !== 0 && runtime.timeInMinutes < RUNTIME_THRESHOLD
}

export async function calculateRuntimes() {
  const masterBuilds = await ciClient.fetchMasterBuilds()

  const stagePromises = masterBuilds.map(build => ciClient.fetchBuildStages(build.number))
  const buildsStages = await Promise.all(stagePromises)
  const runtimes
    = buildsStages.map(filterSpecifiedStages)
      .map(transformBuildToRuntime(masterBuilds))
      .filter(removeOutliers)

  const writer = new CsvWriter(runtimes)
  await writer.toDisk('./runtimes.csv')
  logger.info("Runtimes written to csv")
}
