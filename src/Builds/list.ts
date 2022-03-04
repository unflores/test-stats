import * as logger from '../../logger'
import { BUILD_ERROR, RUNTIME_THRESHOLD, DroneBuild, DroneBuildStage } from '../types'

type Runtime = {
  buildNumber: number,
  timeInMinutes: number
}

// Returns all stages that match the stage names we are timing
export function filterSpecifiedStages(stages: Array<DroneBuildStage>): Array<DroneBuildStage> {
  return stages.filter(stage => stage.name.search(new RegExp(process.env.STAGE_NAMES_REGEX)) != -1)
}

export function transformBuildToRuntime(masterBuilds: Array<DroneBuild>) {
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

export function removeOutliers(runtime: Runtime): Boolean {
  return runtime.buildNumber !== BUILD_ERROR && runtime.timeInMinutes !== 0 && runtime.timeInMinutes < RUNTIME_THRESHOLD
}
