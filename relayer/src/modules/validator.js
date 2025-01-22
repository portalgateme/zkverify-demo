const Ajv = require('ajv')
const ajv = new Ajv({ format: 'fast' })

const proofType = { type: 'string', pattern: '^0x[a-fA-F0-9]{4288}$' }
const bytes32Type = { type: 'string', pattern: '^0x[a-fA-F0-9]{64}$' }

const pgZkVerifySubmitProofSchema = {
  type: 'object',
  properties: {
    proof: proofType,
    publicSignals: {
      type: 'array',
      items: bytes32Type,
      minItems: 1
    },
    vkHash: bytes32Type
  },
  required: ['proof', 'publicSignals', 'vkHash'],
}

const validatePgZkVerifySubmitProof = ajv.compile(pgZkVerifySubmitProofSchema)

function getInputError(validator, data) {
  validator(data)
  if (validator.errors) {
    const error = validator.errors[0]
    return `${error.dataPath} ${error.message}`
  }
  return null
}

function getPgZkVerifySubmitProofInputError(data) {
  return getInputError(validatePgZkVerifySubmitProof, data)
}


module.exports = {
  getPgZkVerifySubmitProofInputError,
}