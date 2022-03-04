import * as list from './list'
import { DroneBuildStage } from '../types'

function buildBuildStage(name: string): DroneBuildStage {
  return {
    id: 1,
    repo_id: 1,
    build_id: 1,
    name,
    status: 'yes',
    started: 1,
    stopped: 1,
    version: 1
  }
}
describe('#filterSpecifiedStages', () => {
  test('Removes stages NOT in the STAGE_NAMES_REGEX', () => {
    const stages = [
      buildBuildStage('tests'),
      buildBuildStage('create')
    ]
    process.env.STAGE_NAMES_REGEX = 'tests'

    expect(list.filterSpecifiedStages(stages)[0].name).toBe('teests')
    expect(list.filterSpecifiedStages(stages).length).toBe(1);
  })

  test('Handles basic regex for filtering', () => {
    const stages = [
      buildBuildStage('tests'),
      buildBuildStage('specs'),
      buildBuildStage('create')
    ]
    process.env.STAGE_NAMES_REGEX = 'tests|specs'

    expect(list.filterSpecifiedStages(stages)[0].name).toBe('tests')
    expect(list.filterSpecifiedStages(stages)[1].name).toBe('specs')
    expect(list.filterSpecifiedStages(stages).length).toBe(2);
  })
})
