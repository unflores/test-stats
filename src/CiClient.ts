const drone = require('drone-node')
import * as logger from '../logger'
import { DroneBuild, DroneBuildWithStages } from './types'


const client = new drone.Client({
  url: process.env.URL,
  token: process.env.TOKEN
})

export async function fetchPreviousBuildPages(totalBuilds: number) {
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
export async function fetchMasterBuilds() {
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

export async function fetchBuildStages(number: number) {
  logger.info(`Fetching stages from build: ${number}`)
  const { stages: buildStages }: DroneBuildWithStages
    = await client.getBuild(process.env.GIT_USER, process.env.REPO, number)
  return buildStages
}
