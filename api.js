//jshint asi:true

const express    = require('express')
const bodyParser = require('body-parser')
const actions    = require('./actions')
const api        = express()

api.use(bodyParser.urlencoded({ extended: false }))
api.use(bodyParser.json())

api.get('/contacts', (req, res) => {
  actions.getAllContactsAndTheirGroups()
    .then((contacts) => {
      res.json(contacts)
    })
    .catch(res.json)
})

api.get('/contacts/:id', (req, res, next) => {
  const contactID = req.params.id
  let contactIDs

  actions.getContactAndTheirGroups(contactID)
    .then((contact) => {
      res.json(contact)
    }, (error) => {

      error.message = 'Please provide a valid contact ID'
      error.status = 404
      return next(error)
    })
    .catch(res.json)
})

api.post('/contacts', (req, res, next) => {
  const { contact, groups } = req.body
  if (!contact.name) {
    const error = new Error('Please provide a name')
    error.status = 402

    return next(error)
  }


  actions.createContactWithGroups(contact, groups)
    .then((contactID) => {
      res.status(201)
      res.json({ id: contactID, message: 'Contact created' })
    })
    .catch(res.json)
})

api.delete('/contacts/:id', (req, res, next) => {
  const contactID = parseInt(req.params.id)
  if (isNaN(contactID)) {
    const error = new Error('Please provide a contact ID number')
    error.status = 402

    return next(error)
  }

  actions.deleteContactAndTheirMemberships(contactID)
    .then((contact) => {
      res.json({ id: contact.id, message: 'Contact deleted' })
    })
    .catch(res.json)
})

api.delete('/groups/:id', (req, res, next) => {
  const groupID = req.params.id
  if (isNaN(groupID)) {
    const error = new Error('Please provide a group ID number')
    error.status = 402

    return next(error)
  }

  actions.deleteGroupAndTheirMemberships(groupID)
    .then((group) => {
      res.json({ id: group.id, message: 'Group deleted' })
    })
    .catch(res.json)
})

// Catch all
api.get('*', (req, res, next) => {
  let err = new Error('This route is not built yet...')
  err.status = 404
  next(err)
})

// Error handling
api.use((err, req, res, next) => {
  res.json({message: err.message, status: err.status})
})

if (!module.parent) {
  const port = process.env.PORT || 3000

  api.listen(port, function () {
    console.log(`Address book API listening on port ${port}!`)
  })
}

module.exports = { api }
