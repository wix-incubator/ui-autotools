const path = require('path')
const compression = require('compression')
const express = require('express')

const app = express()
app.use(compression())
app.use(express.static(path.join(__dirname, 'dist')))

app.listen(3000, () => console.log('Listening:\n - http://localhost:3000'))
