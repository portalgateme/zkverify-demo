const { queue } = require('./queue')
const {
  RelayerError,
  logRelayerError,
} = require('./utils')
const { jobType, status } = require('./config/constants')
const { redis } = require('./modules/redis')
const { submitProof } = require('./worker/zkVerifyWorker')

let currentJob

async function start() {
  try {
    await clearErrors()
    queue.process(processJob)
    console.log('Worker started')
  } catch (e) {
    await logRelayerError(redis, e)
    console.error('error on start worker', e.message)
  }
}

async function processJob(job) {
  try {
    if (!jobType[job.data.type]) {
      throw new RelayerError(`Unknown job type: ${job.data.type}`)
    }
    currentJob = job
    await updateStatus(status.ACCEPTED)
    console.log(`Start processing a new ${job.data.type} job #${job.id}`)
    if (job.data.type === jobType.PG_ZK_VERIFY_SUBMIT_PROOF) {
      const { proof, publicSignals, vkHash } = job.data
      const result = await submitProof(proof, publicSignals, vkHash)
      await updateResult(result, status.CONFIRMED)
      return
    }
  } catch (e) {
    console.error('processJob', e.message, e.stack)
    await updateStatus(status.FAILED)
    throw new RelayerError(e.message)
  }
}

async function updateResult(result, status) {
  console.log(`updateResult:  ${result}`)
  currentJob.data.result = result
  currentJob.data.status = status
  await currentJob.update(currentJob.data)
}

async function updateStatus(status) {
  console.log(`Job status updated ${status}`)
  currentJob.data.status = status
  await currentJob.update(currentJob.data)
}

async function clearErrors() {
  console.log('Errors list cleared')
  await redis.del('errors')
}

start()
