require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan('tiny'))

let persons = [{
  name: 'Arto Hellas',
  number: '040-123456'
},{
  name: 'Ada Lovelace',
  number: '39-44-5323523'
},{
  name: 'Dan Abramov',
  number: '12-43-234345'
},{
  name: 'Mary Poppemdick',
  number: '39-23-6423122'
}]

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/info', (req, res) => {
  const amount = persons.length
  const currentDate = new Date()
    
  const message = `Phonebook has info for ${amount} people <br>${currentDate}<br>`
  console.log(message)
  res.send(message)
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(req.params.id, 
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatePerson => {
      res.json(updatePerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(person => {
      if (person) {
        res.status(204).end()
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    
  const body = req.body
    
  if (!body.name) {
    return res.status(400).json({
      error: 'name missing'
    })
  }

  if (!body.number) {
    return res.status(400).json({
      error: 'Number missing'
    })
  }

  if (persons.find(person => person.name === body.name)) {
    return res.status(400).json({
      error: 'Name must be unique'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })
    
  console.log(person)
    
  person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
})


const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }
    
  next(error)
}
  
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})