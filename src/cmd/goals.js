const input = require('../lib/input')
const getPkg = require('../lib/get-pkg')
const experienceService = require('../services/experience')
const goalService = require('../services/goal')
const goalsHelper = require('../lib/goals')
const updatePkg = require('../lib/update-pkg')
const log = require('../lib/log')
const formatLog = require('../lib/format-log')

module.exports = async function goals (cmd) {
  try {
    const pkg = await getPkg()
    if (!pkg.meta) return log.warn('Navigate to an experience directory and try again')

    const { propertyId, experienceId } = pkg.meta
    const { last_iteration_id: iterationId } = await experienceService.get(experienceId)

    const meta = { propertyId, experienceId, iterationId }
    const goals = await goalService.get(meta)

    switch (cmd) {
      case 'list': return listGoals(meta, goals)
      case 'add': return addGoal(meta, goals).then(() => updatePkg(experienceId))
      case 'remove': return removeGoal(meta, goals).then(() => updatePkg(experienceId))
      case 'set-primary': return setPrimaryGoal(meta, goals).then(() => updatePkg(experienceId))
    }
  } catch (err) {
    log.error(err)
  }
}

async function addGoal (meta, goals) {
  if (goals.length >= 5) return log.warn('Max goals reached, remove a goal first')

  // see if goal exists in chosen goals
  // if it does, filter out that goal if it's an exclusive goal type (cvr, rpv, rpc)
  const goalsAvailableToAdd = goalsHelper.goalNames.filter((goal, i) => {
    const existingGoal = goals.find((existingGoal) => existingGoal.key === goal.value)
    const uniqueGoal = goal.value !== (existingGoal && existingGoal.key) || !goal.exclusive

    return uniqueGoal
  })

  const key = await input.select(formatLog('   Add new goal:'), goalsAvailableToAdd)
  const isUrlGoal = key === 'pageviews.url'
  const isEventGoal = key === 'pageviews.customvalues.uv.events.action'
  const primary = false
  let op = ''
  let type = 'none'
  let value = ''

  if (isUrlGoal) {
    op = await input.select(formatLog('   Choose operator:'), goalsHelper.operators)
  } else if (isEventGoal) {
    op = 'eq'
  }

  if (isUrlGoal || isEventGoal) {
    const additionalPrompt = op === 'in' ? '(space separate for OR\'ing of values)' : ''
    value = (await input.text(formatLog(`   Set value ${additionalPrompt}:`))).split(' ')
    type = 'string'
  }

  const goalToAdd = { key, op, primary, type, value }
  const newGoals = goalsHelper.add(goals, goalToAdd)
  const updatedGoals = await goalService.set(meta, newGoals)

  if (updatedGoals) log.info('Goal added')
}

async function removeGoal (meta, goals) {
  const inputOptions = goalsHelper.read(goals)
  const goalToRemove = await input.select(formatLog(`   Remove goal:`), inputOptions)
  const newGoals = goalsHelper.remove(goals, goalToRemove)
  const updatedGoals = await goalService.set(meta, newGoals)

  if (updatedGoals) log.info('Goal removed')
}

async function setPrimaryGoal (meta, goals) {
  const inputOptions = goalsHelper.read(goals)
  const goalToMakePrimary = await input.select(formatLog(`   Set primary goal to:`), inputOptions)
  const newGoals = goalsHelper.setPrimary(goals, goalToMakePrimary)
  const updatedGoals = await goalService.set(meta, newGoals)

  if (updatedGoals) log.info('Primary goal updated')
}

function listGoals (meta, goals) {
  const inputOptions = goalsHelper.read(goals)
  inputOptions.forEach((goal) => log.info(goal.name))
}
