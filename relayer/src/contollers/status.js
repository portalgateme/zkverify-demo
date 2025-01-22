const queue = require('../queue')

function index(req, res) {
  res.send(
    'This is Relayer service for zkverify demo',
  )
}

async function getJob(req, res) {
  const status = await queue.getJobStatus(req.params.id)
  return status ? res.json(status) : res.status(400).json({ error: "The job doesn't exist" })
}

module.exports = {
  index,
  getJob,
}
