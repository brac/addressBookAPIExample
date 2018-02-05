# A reivew of the Address book API exercise

## Structure
  Postgresql
    pg-promise
      A library for interfacing with databases through promises. We could have used knex but this was the one already present.

    Database
      Using postgresql we run the serice with brew. This was a pain to figure out but things seem to be working all the time.

    Express API
      Another library but this one for making a static server quickly and easy. We use the API to interface with the database and expose those resources in an HTTP response.

## Fixtures
  Usage
    These populate our test database. There were some errors in the form of duplicate entries in the original file.

## Tests
  Methodology
    For writing these tests I would see what the untested functions were in queries_test.js and write a test that would confirm it's core functionaltity was working.

  Libraries
    We used chai-HTTP for our API tests, this allowed us to make HTTP requests to our express server.
    We used express for our API server, which would handel the routes that requests went to.
    We used chai to expect various results
    We used bodyParser to make getting the body info from an HTTP response easy

### Query Tests
  Functions
    There were a lot of functions. Some of the tests required me to call other functions sometimes multiple times to ensure what a group membership was before and after. ID numbers would also change so I had to figure out some values programatiaclly.

  Queries
    Sometimes I would need to go into the actual queries and write some error handeling. I am yet unsure if this is the correct place to handle errors, more on that below.

  Testing errors
    I figured that if I am expecting a success promise then I should return a reject promis rather than outright throw an error. This way we could stick with async design and not have any try / catch blocks.

### API Tests
  Routes
    I could have written some more. Perhaps I will later. I added a catch all route, like a generic 404 page.

  Testing errors
    These errors were different. Since this was an API I didn't want to throw an error and crash the sever, but rather return an error to the user somewhat informing them of what went wrong. So I would ```res.json({Some})```

### Where to throw errors
  What I did
    I had some concern about where I should be throwing errors of if I should let the database throw the error and then handel that. What I settled on was trying to handel the most common errors I could think of and return an intellegent message with them.

  What I could have done
    Maybe I could have thrown the errors in a differt spot, or just handle the database errors as they came.

#### Further Work
  Refactoring
  Extending the schma
  Additional Routes and tests for them

#### Questions
  How to handle errors with asynchronous calles to an api
  Where and how to throw errors within a Promise
  Transactions in relations to SQL databases
  Multiline inserts