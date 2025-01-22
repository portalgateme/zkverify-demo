const jobType = Object.freeze({
  PG_ZK_VERIFY_SUBMIT_PROOF: 'PG_ZK_VERIFY_SUBMIT_PROOF',
})


const status = Object.freeze({
  QUEUED: 'QUEUED',
  ACCEPTED: 'ACCEPTED',
  SENT: 'SENT',
  MINED: 'MINED',
  RESUBMITTED: 'RESUBMITTED',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
})

const ChainId = Object.freeze({
  HARDHAT: 31337,
  SEPOLIA: 11155111,
})

module.exports = {
  jobType,
  status,
  ChainId
}  