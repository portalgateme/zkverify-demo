const {
  getPgZkVerifySubmitProofInputError,
} = require('../modules/validator')
const { postJob } = require('../queue')
const { jobType } = require('../config/constants')

async function pgZkVerifySubmitProof(req, res) {
  const inputError = getPgZkVerifySubmitProofInputError(req.body)
  if (inputError) {
    console.log('Invalid input:', inputError)
    return res.status(400).json({ error: inputError })
  }

  const id = await postJob({
    type: jobType.PG_ZK_VERIFY_SUBMIT_PROOF,
    request: req.body,
  })
  return res.json({ id })
}

module.exports = {
  pgZkVerifySubmitProof,
}
