// Load the self-contained bundle so the deployed function does not depend on
// Vercel tracing packages required by the separately compiled TypeScript.
module.exports = require('./dist/clubApp.bundle.js').default
