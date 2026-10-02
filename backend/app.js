// Vercel's Express service loads this stable entrypoint after buildCommand
// compiles TypeScript and rewrites the backend's path aliases into dist/.
module.exports = require('./dist/clubApp.js').default
