const drone = require('drone-node')
import 'dotenv/config'

import * as logger from './logger'

const client = new drone.Client({
  url: process.env.URL,
  token: process.env.TOKEN
})

type DroneBuild = {
  id: number,
  number: number,   // The higher the number the more recent
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

type DroneException = {
  message: string,
  name: string,
  stack: string,
  config: any
}


// A master build represents a merge to the master branch
async function fetchMasterBuilds() {
  const droneBuilds: Array<DroneBuild> = await client.getBuilds(process.env.GIT_USER, process.env.REPO)
  // console.info(droneBuilds)
  const builds = droneBuilds.filter((build) => build.target === 'master')
    .sort((a, b) => a.number - b.number)
  // logger.info(builds)
  return builds
}

async function fetchBuildStages(number: number) {
  const { stages: buildStages }: DroneBuildWithStages
    = await client.getBuild(process.env.GIT_USER, process.env.REPO, number)
  // console.log(buildStages)
  return buildStages
}

function filterRspecRuntimes(stages: Array<DroneBuildStage>): Array<DroneBuildStage> {
  return stages.filter(stage => stage.name.search(/backend_unit_tests|backend_request_tests/) != -1)
}

function calculateRuntime(masterBuilds: Array<DroneBuild>) {
  return (stages: Array<DroneBuildStage>) => {
    return {
      buildNumber: masterBuilds.find(masterBuild => masterBuild.id == stages[0].build_id).number,
      runtime: stages.map(stage => stage.stopped - stage.started)
        .reduce((partialSum, current) => partialSum + current, 0) / 60
    }
  }
}

async function calculateBuildTimes() {
  const masterBuilds = await fetchMasterBuilds()

  const stagePromises = masterBuilds.map(build => fetchBuildStages(build.number))
  const buildsStages = await Promise.all(stagePromises)
  const runtimes = buildsStages.map(filterRspecRuntimes).map(calculateRuntime(masterBuilds))
  logger.info(runtimes)
}

calculateBuildTimes().catch((reason: DroneException) => {
  console.error(reason)
})



