// This script runs on serverside

import expect from 'chai';
import sessionHandler from '../../sessionHandler.js';
import User from '../../user.js';

describe('Testing session functions', function() {
    it('test if user gets stored in session', function(done) {
        let user = new User(1, 'testuser', 'testfirstname', 'testlastname', 'testpw', 'testemail');
        //TODO: how do i test it correctly?
        //should i return a user object or check what the values are in req.session?
        expect(sessionHandler.setUserToSession(req, res, user)).to.equal(true);
        done();
    });
});
