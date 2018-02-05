//jshint asi:true
const chai   = require('chai')
const expect = chai.expect
const { resetDatabase } = require('./helpers.js')
const { allContacts,
        createContact,
        getContactByID,
        contactsWithName,
        deleteContact,
        deleteAllContacts,
        allGroups,
        createGroup,
        groupWithName,
        findOrCreateGroupByName,
        deleteGroup,
        deleteAllGroups,
        groupsForContact,
        deleteMembershipsForContact,
        deleteMembershipsForGroup,
        deleteAllMemberships,
        membersOfGroup,
        allGroupsWithMembers,
        addContactToGroup,
        removeContactFromGroup
} = require('../database/queries.js')

describe('Database queries', () => {
  beforeEach(resetDatabase)

  context('allContacts()', () => {
    it('returns all records in the contacts table', () => {
      return allContacts().then((records) => {
        expect(records.length).to.equal(20)
      })
      .catch(err => { throw err })
    })

    it('includes id, name, email, phone, birthday, and company', () => {
      return allContacts().then((records) => {
        expect(records[0])
          .to.have.all.keys('id', 'name', 'email', 'phone', 'birthday', 'company')
      })
      .catch(err => { throw err })
    })
  })

  context('createContact()', () => {
    const birthday = new Date('1980-05-04T00:00:00')

    it('creates a new contact with the correct data', () => {
      const newContact = {name: 'Bill', email: 'bill@farts.com', phone: '555-888-1234', birthday: birthday, company: 'USA Today'}

      // Create the contact
      return createContact(newContact).then((data) => {
        const { id } = data

        // Get a new list of contacts to test against
        return allContacts().then((records) => {
          const createdContact = records.find((obj) => { return obj.id === id; })
          expect(createdContact).to.have.deep.property('name', 'Bill');
          expect(createdContact).to.have.deep.property('email', 'bill@farts.com');
          expect(createdContact).to.have.deep.property('phone', '555-888-1234');
          expect(createdContact).to.have.deep.property('birthday', birthday);
          expect(createdContact).to.have.deep.property('company', 'USA Today');
        })
      })
      .catch(err => { throw err })
    })

    it('throws an error if name missing', () => {
      const incompleteContact = {email: 'patty@aol.com', phone: '555-888-1234', birthday: birthday, company: 'UHS'}

      return createContact(incompleteContact)
        .then(() => {})
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error).with.property('message', 'Name and Email must be provided.')
        })
      .catch(err => { throw err })
    })

    it('throws an error if email missing', () => {
      const incompleteContact = {name: 'Patty', phone: '555-888-1234', birthday: birthday, company: 'UHS'}

      return createContact(incompleteContact)
        .then(() => {})
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error).with.property('message', 'Name and Email must be provided.')
        })
      .catch(err => { throw err })
    })
  })

  context('getContactByID()', () => {
    it('returns the correct contact matched by ID', () => {
      return getContactByID(1).then((contact)=>{
        expect(contact.name).to.equal('Dinnie Feore')
      }).catch(err => { throw err })
    })

    it('throws an error if no ID is provided', () => {
      return getContactByID()
      .then(() => {})
      .catch(err => {
        expect(err).to.be.an.instanceOf(Error).with.property('message', 'Please provide a contact ID.')
      })
      .catch(err => { throw err })
    })
  })

  context('contactsWithName()', () => {
    it('returns all the contacts with matching names', () => {
      return contactsWithName('Binnie Graves').then((contact) => {
        expect(contact[0]).to.have.property('phone','56-(651)166-6577')
      })
      .catch(err => { throw err })
    })

    it('throws and error if an integer is provided', () => {
      return contactsWithName(2)
      .then(() => {})
      .catch(err => {
        expect(err).to.be.an.instanceOf(Error).with.property('message', 'Please provide a name, not an integer.')
      })
      .catch(err => { throw err })
    })
  })

  context('deleteContact()', () => {
    it('deletes the provided contact', () => {
      const id = 1

      return deleteMembershipsForContact(id).then(() => {
        return deleteContact(id)
      }).then(() => {
        return allContacts()
      }).then((contacts) => {
        expect(contacts.length).to.equal(19)
        return getContactByID(id)
      }).then((contact) => {
        expect(contact).to.be.null //jshint ignore:line
      })
      .catch(err => { throw err })
    })

    it('throws an error if a string is provided', () => {
      return deleteContact('cat')
      .then(() => {})
      .catch(err => {
        expect(err).to.be.an.instanceOf(Error).with.property('message', 'Please provide a contact ID number.')
      })
      .catch(err => { throw err })
    })
  })

  context('deleteAllContacts()', () => {
    it('delete all the contacts', () => {
      let numOfContacts
      let ids

      // Get initial contact info and an array of ids
      return allContacts().then((contacts) =>{
        numOfContacts = contacts.length
        ids           = contacts.map(contact => contact.id)

        // Remore membership for all contacts
        return Promise.all(
          ids.map( (id) => deleteMembershipsForContact(id)))
      }).then( () => {

        // Delete all contacts
        return deleteAllContacts()
      }).then( () => {

        // Test against new list of all contacts, which should be 0
        return allContacts()
      }).then((contacts) => {
        expect(numOfContacts).to.equal(20)
        expect(contacts.length).to.equal(0)
      })
      .catch(err => { throw err })
    })
  })

  context('allGroups()', () => {
    it('returns all the groups', () => {
      return allGroups().then( (groups) => {
        expect(groups.length).to.equal(6)
      })
      .catch(err => { throw err })
    })

    it('has the correct group names ', () => {
      return allGroups().then( (groups) => {
        let members = []
        groups.forEach((group) => {
          members.push(group.name)
        })
        expect(members).to.have.members([
          'Trivia Group',
          'Book Club',
          'Family',
          'Colleagues',
          'Soccer Team',
          'Friends'
        ])
      })
      .catch(err => { throw err })
    })
  })

  context('createGroup()', () => {
    it('creates and adds a new group', () => {
      const newGroup = {name: 'Puppyfaces'}
      let newGroupName

      return createGroup(newGroup).then( (data) => {
        newGroupName = data.name
        return allGroups()
      }).then((groups) => {
        expect(newGroupName).to.equal('Puppyfaces')
        expect(groups.length).to.equal(7)
      })
      .catch(err => { throw err })
    })

    it('throws an error if no name is provided', () => {
      return createGroup({ name: '' })
      .then(() => {})
      .catch(err => {
        expect(err).to.be.an.instanceOf(Error).with.property('message', 'Please provide a name for the group.')
      })
      .catch(err => { throw err })
    })
  })

  context('groupWithName()', () => {
    it('return the id and name of correct group', () => {
      let groupID

      return allGroups().then((data) => {
        groupID = data.find((group) => { return group.name === 'Book Club'; }).id

        return groupWithName('Book Club')
      }).then((data) => {
        const { id, name } = data

        expect(name).to.equal('Book Club')
        expect(id).to.equal(groupID)
      })
      .catch(err => { throw err})
    })

    it('Throw an error if no name is provided', () => {
      return groupWithName()
        .then(() => {})
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error).with.property('message', 'Please provide a group name.')
        })
      .catch(err => { throw err })
    })
  })

  context('findOrCreateGroupByName()', () => {
    it('will find a group based on the group name provided', () => {
      return findOrCreateGroupByName('Friends').then( (records) => {
        expect(records).to.have.property('name', 'Friends')
      })
      .catch(err => { throw err })
    })

    it('will create a group if the group name provided does not exist', () => {
      let originalGroupCount
      let newGroupCount

      return allGroups().then((data) => {
        originalGroupCount = data.length
        return findOrCreateGroupByName('Programmers')
      }).then( () => {
        return allGroups()
      }).then((data) => {
        newGroupCount = data.length
        expect(newGroupCount - originalGroupCount).to.equal(1)
      })
      .catch(err => { throw err })
    })

    it('will throw an error if an integer is provided for the group name', () => {
      return findOrCreateGroupByName(69)
        .then(() => {})
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error).with.property('message', 'Please provide a name to search for or create.')
      })
      .catch(err => { throw err })
    })
  })

  context('deleteGroup()', () => {
    it('deletes the specified group ', () => {
      return deleteMembershipsForGroup(1).then(() => {
        return deleteGroup(1)
      }).then(() => {
        return allGroups()
      }).then((groups) => {
        expect(groups.find(grp => grp.id === 1)).to.be.an('undefined')
        expect(groups.length).to.equal(5)
      })
      .catch(err => { throw err })
    })

    it('throws an error if a string is provided', () => {
      return deleteGroup('dog')
        .then(() => {})
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error).with.property('message', 'Please provide the group id number')
        })
      .catch(err => { throw err })
    })
  })

  context('deleteAllGroups()', () => {
    it('will delete all the groups', () => {
      return deleteAllMemberships().then(() => {
        return deleteAllGroups()
      }).then(() => {
        return allGroups()
      }).then((groups) => {
        expect(groups.length).to.equal(0)
      })
      .catch(err => { throw err })
    })
  })

  context('groupsForContact()', () => {
    it('return the groups for the provided contact ID', () => {
      return groupsForContact(8).then((data) => {
        expect(data.length).to.equal(3)
      })
      .catch(err => { throw err })
    })

    it('will throw an error if a string is provided', () => {
      return groupsForContact('dog')
        .then(() => {})
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error).with.property('message', 'Please provide a valid contact ID')
      })
      .catch(err => { throw err })
    })
  })

  context('deleteMembershipsForContact()', () => {
    it('delete the membership of a contact to a group', () => {
      return deleteMembershipsForContact(8).then(() => {
        return groupsForContact(8)
      }).then((contacts) => {
        expect(contacts.length).to.equal(0)
      })
      .catch(err => { throw err })
    })

    it('will throw an error if a string is provided', () => {
      return deleteMembershipsForContact('Ben')
        .then(() => {})
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error).with.property('message', 'Please provide a valid contact ID')
      })
      .catch(err => { throw err })
    })
  })

  context('deleteMembershipsForGroup()', () => {
   it('deletes all the contact membership for a provided group id ', () => {
    return deleteMembershipsForGroup(1).then(() => {
      return groupsForContact(8)
    }).then((groups) => {
      expect(groups.length).to.have.equal(2)
    })
    .catch(err => { throw err })
   })

   it('will throw an error if a string is provided', () => {
      return deleteMembershipsForGroup('Friends')
        .then(() => {})
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error).with.property('message', 'Please provide a valid contact ID')
      })
      .catch(err => { throw err })
    })
  })

  context('deleteAllMemberships()', () => {
    it('deletes all the membership for all groups', () => {
      return deleteAllMemberships().then(() => {
        return groupsForContact(8)
      }).then((data) => {
        expect(data.length).to.equal(0)
      })
      .catch(err => { throw err })
    })
  })

  context('membersOfGroup()', () => {
    it('return a list of contacts that belong to a group', () => {
      return membersOfGroup('Family').then((members)=>{
        expect(members[0]).to.have.all.keys('id', 'name', 'email', 'phone', 'birthday', 'company')
        expect(members.length > 2).to.be.true //jshint ignore:line
      })
      .catch(err => { throw err })
    })

    it('will throw an error if an integer is provided', () => {
      return membersOfGroup(1)
        .then(() => {})
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error).with.property('message', 'Please provide a valid group name')
       })
       .catch(err => { throw err })
    })
  })

  context('allGroupsWithMembers()', () => {
    it('return all the groups and their membership', () => {
      return allGroupsWithMembers().then((data) => {
        expect(data.length).to.equal(39)
      })
      .catch(err => { throw err })
    })
  })

  context('addContactToGroup()', () => {
    it('will add a contact to a specified group', () => {
      let numOfContacts
      let colleagueGroupID
      const birthday = new Date('1980-05-04T00:00:00')
      const newContact = {name: 'Bill', email: 'bill@farts.com', phone: '555-888-1234', birthday: birthday, company: 'USA Today'}
      let newContactId

      return createContact(newContact).then((data)=> {
        newContactId = data.id
        return membersOfGroup('Colleagues')
      }).then((members) => {
        numOfContacts = members.length
        return allGroups()
      }).then((data) => {
        colleagueGroupID = data.find((group) => { return group.name === 'Colleagues' }).id
        return addContactToGroup({contactID: newContactId, groupID: colleagueGroupID})
      }).then(() => {
        return membersOfGroup('Colleagues')
      }).then((data)=>{
        expect(data.length - numOfContacts).to.equal(1)
      })
      .catch(err => { throw err })
    })

    it('will throw an error if a string is provided', () => {
      return addContactToGroup({contactID: 'Lenny', groupID: 2})
        .then(() => {})
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error).with.property('message', 'Please provide a valid contact ID')
      })
      .catch(err => { throw err })
    })
  })

  context('removeContactFromGroup()', () => {
    it('will remove the contact from the group', () => {
      let oldGroups

      return groupsForContact(8).then((data) => {
        oldGroups = data
        return removeContactFromGroup({contactID: 8, groupID: 5})
      }).then(() => {
        return groupsForContact(8)
      }).then((data) => {
        expect(oldGroups.length - data.length).to.equal(1)
      })
      .catch(err => { throw err })
    })

    it('will throw an error if a string is proivded', () => {
      return removeContactFromGroup({contactID: 'Rudy', groupID: 2})
        .then(() => {})
        .catch(err => {
          expect(err).to.be.an.instanceOf(Error).with.property('message', 'Please provide a valid contact ID')
      })
      .catch(err => { throw err })
    })
  })
})