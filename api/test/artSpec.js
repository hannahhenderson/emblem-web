const { expect } = require('chai');
const request = require('request');
const httpMocks = require('node-mocks-http');

const { postNewArt, downloadById, getFromDbById, deleteById,
        getAllFromDb, postToPlaceById,
      } = require('../resources/art/artController');

const connection = require('../db/db');
const { db, Art, Place, User, ArtPlace } = connection;

const placeRecord = { lat: 0, long: 0, sector: '00000' };
const artRecord = { type: 'test' };
const userRecord = { fbookId: '0' };

/* *********** ROUTE TESTS ***********************
 * Due to authentication, all of these routes will fail
 * They should still be reached, however */

describe('Confirm Art Routes protected by OAuth\n-------------------------\n', () => {
  let testUser;

  before((done) => {
    db.sync()
      .then(() => User.create(userRecord)
        .then(user => {
          testUser = user;
          done();
        }));
  });

  it('should postNewArt', (done) => {
    request.post({
      url: 'http://localhost:3000/art',
      headers: {
        'content-type': 'application/json',
        'file-type': '.jpeg',
      },
      user: testUser,
    }, (err, response) => {
      expect(response.statusCode).to.equal(401);
      done();
    });
  });

  it('should downloadById', (done) => {
    request.get({
      url: 'http://localhost:3000/art/1/download',
      headers: {
        'content-type': 'application/json',
      },
      params: { id: 1 },
    }, (err, response) => {
      expect(response.statusCode).to.equal(401);
      done();
    });
  });

  it('should deleteById', (done) => {
    request.post({
      url: 'http://localhost:3000/art/1/delete',
      headers: {
        'content-type': 'application/json',
      },
      params: { id: 1 },
    }, (err, response) => {
      expect(response.statusCode).to.equal(401);
      done();
    });
  });

  it('should getFromDbById', (done) => {
    request.get({
      url: 'http://localhost:3000/art/1',
      headers: {
        'content-type': 'application/json',
      },
      params: { id: 1 },
    }, (err, response) => {
      expect(response.statusCode).to.equal(401);
      done();
    });
  });

  it('should getAllFromDb', (done) => {
    request.get({
      url: 'http://localhost:3000/art/',
      headers: {
        'content-type': 'application/json',
      },
    }, (err, response) => {
      expect(response.statusCode).to.equal(401);
      done();
    });
  });

  it('should postToPlaceById', (done) => {
    request.post({
      url: 'http://localhost:3000/art/1/place',
      headers: {
        'content-type': 'application/json',
      },
      params: { id: 1 },
    }, (err, response) => {
      expect(response.statusCode).to.equal(401);
      done();
    });
  });

  it('should addCommentById', (done) => {
    request.post({
      url: 'http://localhost:3000/art/1/comment',
      headers: {
        'content-type': 'application/json',
      },
      params: { id: 1 },
    }, (err, response) => {
      expect(response.statusCode).to.equal(401);
      done();
    });
  });

  it('should getAllCommentsForId', (done) => {
    request.get({
      url: 'http://localhost:3000/art/1/comment',
      headers: {
        'content-type': 'application/json',
      },
      params: { id: 1 },
    }, (err, response) => {
      expect(response.statusCode).to.equal(401);
      done();
    });
  });

  it('should voteById', (done) => {
    request.post({
      url: 'http://localhost:3000/art/1/vote',
      headers: {
        'content-type': 'application/json',
      },
      params: { id: 1 },
    }, (err, response) => {
      expect(response.statusCode).to.equal(401);
      done();
    });
  });

  it('should getAllVotesForId', (done) => {
    request.get({
      url: 'http://localhost:3000/art/1/vote',
      headers: {
        'content-type': 'application/json',
      },
      params: { id: 1 },
    }, (err, response) => {
      expect(response.statusCode).to.equal(401);
      done();
    });
  });

  after(() => {
    db.sync()
      .then(() => User.destroy({ where: userRecord }));
  });
});

/* *********** CONTROLLER TESTS **************** */
xdescribe('Test Art Controllers\n-------------------------\n', () => {
  let testUser, testArt, testPlace, awsArt;
  // let getReq;

  before((done) => {
    db.sync()
      .then(() => User.create(userRecord)
        .then(user => { testUser = user; })
      .then(() => Art.create(artRecord)
        .then(art => {
          testArt = art;
        }))
      .then(() => Place.create(placeRecord)
        .then(place => {
          testPlace = place;
          done();
        })));
  });

  xit('should postNewArt (AWS and Db)', (done) => {
    const req = httpMocks.createRequest({
      method: 'POST',
      headers: {
        'file-type': 'jpeg',
        'Content-Type': 'application/octet-stream',
      },
      user: testUser,
      body: 'definitely some art',
    });

    const res = httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter,
    });

    res.on('end', () => {
      expect(res.statusCode).to.equal(200);
      done();
    });

    postNewArt(req, res);
  });

  xit('should downloadById (AWS and Db)', (done) => {
    Art.findOne({ where: { UserId: testUser.id } })
      .then(art => {
        awsArt = art;
        const req = httpMocks.createRequest({
          method: 'GET',
          params: {
            id: art.id,
          },
        });

        const res = httpMocks.createResponse({
          eventEmitter: require('events').EventEmitter,
        });

        res.on('end', () => {
          expect(res.statusCode).to.equal(200);
          done();
        });

        downloadById(req, res);
      });
  });

  it('should get specific art, getFromDbById', (done) => {
    const req = httpMocks.createRequest({
      method: 'GET',
      params: { id: awsArt.id },
    });

    const res = httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter,
    });

    res.on('end', () => {
      expect(res.statusCode).to.equal(200);
      new Promise((resolve, reject) => {
        resolve(res._getData());
      })
      .then(data => {
        const dataId = JSON.parse(data).id;
        expect(dataId).to.equal(awsArt.id);
        done();
      });
    });

    getFromDbById(req, res);
  });

  it('get all art, getAllFromDb', (done) => {
    const req = httpMocks.createRequest({
      method: 'GET',
    });

    const res = httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter,
    });

    res.on('end', () => {
      expect(res.statusCode).to.equal(200);
      done();
    });

    getAllFromDb(req, res);
  });

  it('should postToPlaceById', (done) => {
    const req = httpMocks.createRequest({
      method: 'POST',
      user: testUser,
      params: { id: awsArt.id },
      body: {
        lat: testPlace.lat,
        long: testPlace.long,
      },
    });

    const res = httpMocks.createResponse({
      eventEmitter: require('events').EventEmitter,
    });

    res.on('end', () => {
      expect(res.statusCode).to.equal(200);
      done();
    });

    postToPlaceById(req, res);
  });

  xit('should deleteById (AWS and Db)', (done) => {
    const req = {
      method: 'GET',
      params: { id: awsArt.id },
    };
    const res = {};
    res.status = (statusCode) => {
      expect(statusCode).to.be.within(199, 205);
      done();
    };

    deleteById(req, res);
  });


  after(() => {
    db.sync()
      .then(() => Art.destroy({ where: { UserId: testUser.id } }))
      .then(() => ArtPlace.destroy({ where: { ArtId: testArt.id } }))
      .then(() => Place.destroy({ where: { UserId: testUser.id } }))
      .then(() => User.destroy({ where: userRecord }));
  });
});
