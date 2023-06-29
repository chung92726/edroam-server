import express from 'express'
import cors from 'cors'
import fs from 'fs'
import mongoose from 'mongoose'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
const morgan = require('morgan')
require('dotenv').config()

const csrfProtection = csrf({ cookie: true })
// var parseForm = bodyParser.urlencoded({ extended: false })

// create express app
const app = express()

// connect do db
mongoose
  .connect(process.env.DATABASE, {
    authSource: 'admin',
    user: 'Frankie',
    pass: process.env.DB_PASSWORD,
  })
  .then((e) => console.log('DB connected'))
  .catch((err) => console.log('DB CONNECTION ERROR: '))

// apply middlewares : functions that perform tasks on incoming requests before they reach the routes and send back responses

app.use(cors())
app.use(express.json({ limit: '5mb' }))
app.use(cookieParser())
app.use(morgan('dev'))
// app.use((req, res, next) => {
//   console.log('this is my middleware')
//   next()
// })

//route
fs.readdirSync('./routes').map((r) => {
  app.use('/api', require(`./routes/${r}`))
})

// csrf
app.use(csrfProtection)
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// app.get('/', (req, res) => {
//   res.send('you hit server endpoint')
// })

// port
const port = process.env.PORT || 8000

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
