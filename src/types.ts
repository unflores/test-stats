// We use this number as a build id for failed builds
export const BUILD_ERROR = -1
// Any runtime over 1000 minutes will be seen as having failed
// even if it completes successfully
export const RUNTIME_THRESHOLD = 300

export type DroneException = {
  message: string,
  name: string,
  stack: string,
  config: any
}

export type DroneBuild = {
  id: number,
  number: number,   // The higher the number the more recent. This is the build number in the url
  repo_id: number,
  source: string,
  target: string,
  started: number,
  finished: number,
  version: number
}

export type DroneBuildStage = {
  id: number,
  repo_id: number,
  build_id: number, // Corresponds to the id field on build
  name: string,
  status: string,
  started: number,
  stopped: number,
  version: number
}

export type DroneBuildWithStages = DroneBuild & {
  stages: Array<DroneBuildStage>
}
