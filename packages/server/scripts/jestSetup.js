const { tmpdir } = require("os")

process.env.NODE_ENV = "jest"
process.env.JWT_SECRET = "test-jwtsecret"
process.env.CLIENT_ID = "test-client-id"
process.env.BUDIBASE_DIR = tmpdir("budibase-unittests")
process.env.ADMIN_SECRET = "test-admin-secret"

// makes the output of the tests messy
// but please temporarily enable for debugging :)
process.env.LOGGER = "off"