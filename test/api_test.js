// jshint asi:true

const chai     = require('chai')
const chaiHTTP = require('chai-http')
const expect   = chai.expect

const { api }   = require('../api.js')
const { resetDatabase } = require('./helpers.js')

chai.use(chaiHTTP)

describe('Address book API', () => {
  beforeEach(resetDatabase)

  context('GET /contacts', () => {
    it('responds with a JSON array of all contact data', () => {
      return chai.request(api)
        .get('/contacts')
        .then((res) => {
          expect(res.body).to.be.a('array')
          expect(res.body.length).to.equal(20)
        })
        .catch(err => { throw err })
    })

    it('includes contact id, name, email, phone, birthday, company, and groups', () => {
      return chai.request(api)
        .get('/contacts')
        .then((res) => {
          const sampleContact = res.body[0]
          const props = ['id', 'name', 'email', 'phone', 'birthday', 'company', 'groups']

          expect(sampleContact).to.have.all.keys(props)
          expect(sampleContact.groups).to.be.a('array')
        })
        .catch(err => { throw err })
    })
  })

  context('GET /contacts/:id', () => {
    it('responds with a json object of a contact\'s data', () => {
      return chai.request(api)
        .get('/contacts/1')
        .then((res) => {
          expect(res.body).to.be.a('object')
        })
        .catch( err => { throw err })
    })

    it('includes the contact id, name, email, phone, birthday, company, and groups', () => {
      return chai.request(api)
        .get('/contacts/1')
        .then((res) => {
          const props = ['id', 'name', 'email', 'phone', 'birthday', 'company', 'groups']
          expect(res.body).to.have.all.keys(props)
        })
        .catch( err => { throw err })
    })

    it('responds with an error message if no contact was found', () => {
      let randomContact = Math.floor(Math.random() * 90) + 30

      return chai.request(api)
        .get(`/contacts/${randomContact}`)
        .then((res) => {

          expect(res.body).to.have.property('status', 404)
          expect(res.body).to.have.property('message', 'Please provide a valid contact ID')
        })
        .catch( err => { throw err })
    })
  })

  context('POST /contacts', () => {
    const newContact = {
      name: 'Jenna',
      email: 'jenna@farts.com',
      phone: '555-543-1234',
      birthday: new Date('1980-05-04T00:00:00'),
      company: 'UHS'
    }
    const groups = ['Friends', 'Family']
    let newID

    it('responds with a json array of the new contact ID and success message', () => {

      return chai.request(api)
        .post('/contacts')
        .send({contact: newContact, groups: groups})
        .then((res) => {
          newID = res.body.id

          expect(res.body).to.have.property('id')
          expect(res.body).to.have.property('message', 'Contact created')

          return chai.request(api)
            .get(`/contacts/${newID}`)
        })
        .then((res) => {
          expect(res.body.name).to.equal('Jenna')
          expect(res.body.email).to.equal('jenna@farts.com')
          expect(res.body.phone).to.equal('555-543-1234')
          expect(res.body.birthday).to.equal('1980-05-04T05:00:00.000Z')
          expect(res.body.company).to.equal('UHS')
        })
        .catch( err => { throw err })
    })

    it('creats the contact with appropriate groups', () => {
      return chai.request(api)
        .post('/contacts')
        .send({contact: newContact, groups: groups})
        .then((res) => {
          newID = res.body.id

          return chai.request(api)
            .get(`/contacts/${newID}`)
        })
        .then((res) => {
          expect(res.body.groups).to.have.members(['Friends', 'Family'])
        })
        .catch( err => { throw err })
    })

    it('responds with an error if the name is missing', () => {
      const incompleteContact = {
        email: 'missingName@farts.com',
        phone: '555-543-1234',
        birthday: new Date('1980-05-04T00:00:00'),
        company: 'UHS'
      }

      return chai.request(api)
        .post('/contacts')
        .send({contact: incompleteContact, groups: groups})
        .then((res) => {
          expect(res.body).to.have.property('status', 402)
          expect(res.body).to.have.property('message', 'Please provide a name')
        })
        .catch( err => { throw err })
    })
  })

  context('DELETE /contacts/:id', () => {
    it('responds with the deleted contact ID and success message', () => {
      const contactID = 2

      return chai.request(api)
        .delete(`/contacts/${contactID}`)
        .then((res) => {
          expect(res.body).to.have.property('id', contactID)
          expect(res.body).to.have.property('message', 'Contact deleted')
        })
        .catch( err => { throw err })

    })

    it('deletes the correct entry', () => {
      const contactID = 3

      return chai.request(api)
        .delete(`/contacts/${contactID}`)
        .then((res) => {
          return chai.request(api)
          .get('/contacts')
        })
        .then((res) => {
          const deletedID = (res.body.find((contact) => { return contact.id === contactID}))

          expect(res.body.length).to.equal(19)
          expect(deletedID).to.be.undefined //jshint ignore:line
        })
        .catch( err => { throw err })
    })

    it('responds with an error if provided with string', () => {
      return chai.request(api)
        .delete('/contacts/ben')
        .then((res) => {
          expect(res.body).to.have.property('status', 402)
          expect(res.body).to.have.property('message', 'Please provide a contact ID number')
        })
    })
  })

  context('DELETE /groups/:id', () => {
    it('responds with the group ID and success message', () => {
      let randomGroup = Math.floor(Math.random() * 6) + 1

      return chai.request(api)
        .delete(`/groups/${randomGroup}`)
        .then((res) => {
          expect(res.body).to.have.property('id', randomGroup)
          expect(res.body).to.have.property('message', 'Group deleted')
        })
    })

    it('responds with an error if provided with a string', () => {
      return chai.request(api)
        .delete('/groups/Friends')
        .then((res) => {
          expect(res.body).to.have.property('status', 402)
          expect(res.body).to.have.property('message', 'Please provide a group ID number')
        })
    })
  })
})