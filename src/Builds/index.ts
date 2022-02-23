const drone = require('drone-node')
import * as logger from '../../logger'
import CsvWriter from 'objects-to-csv'

const client = new drone.Client({
  url: process.env.URL,
  token: process.env.TOKEN
})

// We use this number as a build id for failed builds
const BUILD_ERROR = -1
// Any runtime over 1000 minutes will be seen as having failed
// even if it completes successfully
const RUNTIME_THRESHOLD = 300

type DroneBuild = {
  id: number,
  number: number,   // The higher the number the more recent. This is the build number in the url
  repo_id: number,
  source: string,
  target: string,
  started: number,
  finished: number,
  version: number
}
type DroneBuildStage = {
  id: number,
  repo_id: number,
  build_id: number, // Corresponds to the id field on build
  name: string,
  status: string,
  started: number,
  stopped: number,
  version: number
}

type DroneBuildWithStages = DroneBuild & {
  stages: Array<DroneBuildStage>
}

export type DroneException = {
  message: string,
  name: string,
  stack: string,
  config: any
}

async function fetchPreviousBuildPages(totalBuilds: number) {
  // Builds appear hardcoded to 25 per page for some reason...
  const buildsPerPage = 25
  const pageLimit = totalBuilds / buildsPerPage
  let droneBuilds: Array<DroneBuild> = []
  for (let page = 2; page < pageLimit; page++) {
    let newDroneBuilds = await client.getBuilds(process.env.GIT_USER, process.env.REPO, page)

    if (newDroneBuilds.length === 0) return droneBuilds

    droneBuilds = [...newDroneBuilds, ...droneBuilds]
  }

  return droneBuilds
}

// A master build represents a merge to the master branch
async function fetchMasterBuilds() {
  logger.info('Fetch builds of Master')
  const droneBuilds: Array<DroneBuild> = await client.getBuilds(process.env.GIT_USER, process.env.REPO)
  // Assume this is the number of builds
  const mostRecentId = droneBuilds[0].id
  const previousDroneBuilds = await fetchPreviousBuildPages(mostRecentId)
  const builds = [...droneBuilds, ...previousDroneBuilds].filter((build) => build.target === 'master')
    .sort((a, b) => b.number - a.number)
  logger.info(`Total Builds to master: ${builds.length}`)
  return builds
}

async function fetchBuildStages(number: number) {
  logger.info(`Fetching stages from build: ${number}`)
  const { stages: buildStages }: DroneBuildWithStages
    = await client.getBuild(process.env.GIT_USER, process.env.REPO, number)
  return buildStages
}

// Returns all stages that match the stage names we are timing
function filterRspecRuntimes(stages: Array<DroneBuildStage>): Array<DroneBuildStage> {
  return stages.filter(stage => stage.name.search(new RegExp(process.env.STAGE_NAMES_REGEX)) != -1)
}

function calculateRuntime(masterBuilds: Array<DroneBuild>) {
  return (stages: Array<DroneBuildStage>) => {
    // Some stages don't have build ids. I could probably filter out those stages as invalid earlier on, maybe the build itself should be considered invalid...
    //
    try {
      return {
        buildNumber: masterBuilds.find(masterBuild => masterBuild.id == stages[0].build_id).number,
        runtimeInMinutes: stages.map(stage => stage.stopped - stage.started)
          .reduce((partialSum, current) => partialSum + current, 0) / 60
      }
    } catch (err) {
      logger.debug(err)

      return {
        buildNumber: BUILD_ERROR,
        runtime: 0
      }
    }
  }
}

export async function calculateRuntimes() {
  const masterBuilds = await fetchMasterBuilds()

  const stagePromises = masterBuilds.map(build => fetchBuildStages(build.number))
  const buildsStages = await Promise.all(stagePromises)
  const runtimes
    = buildsStages.map(filterRspecRuntimes)
      .map(calculateRuntime(masterBuilds))
      .filter(runtime => runtime.buildNumber !== BUILD_ERROR && runtime.runtimeInMinutes !== 0 && runtime.runtimeInMinutes < RUNTIME_THRESHOLD)

  const writer = new CsvWriter(runtimes)
  await writer.toDisk('./runtimes.csv')
  logger.info("Runtimes written to csv")

}
