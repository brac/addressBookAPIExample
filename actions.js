//jshint asi:true

const sql = require('./database/queries.js')

function getGroups(contact) {
  return sql.groupsForContact(contact.id)
    .then((groups) => {
      contact.groups = groups.map( g => g.name)
      return contact
    })
}

function getAllContactsAndTheirGroups() {
  return sql.allContacts()
    .then((contacts) => {
      return Promise.all(contacts.map((contact) => {
        return getGroups(contact)
      }))
    })
}

function getContactAndTheirGroups(contactID) {
  return sql.getContactByID(contactID)
    .then((contact) => {
      return getGroups(contact)
    })
}

function createContactWithGroups(contactInfo, groups) {
  if (!contactInfo.name) throw "Contact must have a name"
  if (!contactInfo.email) throw "Contact must have a email"

  return sql.createContact(contactInfo)
    .then((contact) => {
      const contactID = contact.id

      return Promise.all(groups.map((groupName) => {
        return sql.findOrCreateGroupByName(groupName)
      }))
      .then((groupRecords) => {
        return Promise.all(groupRecords.map((group) => {
          const groupID = group.id
          return sql.addContactToGroup({contactID, groupID})
        }))
      })
      .then(() => contactID)
    })
}

function deleteContactAndTheirMemberships(contactID) {
  return sql.deleteMembershipsForContact(contactID)
    .then(() => sql.deleteContact(contactID))
}

function deleteGroupAndTheirMemberships(groupID) {
  return sql.deleteMembershipsForGroup(parseInt(groupID))
    .then(() => sql.deleteGroup(parseInt(groupID)))
}

module.exports = {
  getAllContactsAndTheirGroups,
  getContactAndTheirGroups,
  createContactWithGroups,
  deleteContactAndTheirMemberships,
  deleteGroupAndTheirMemberships,
}