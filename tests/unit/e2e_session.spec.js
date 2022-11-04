// This script runs on serverside

import chai from 'chai';
let expect = chai.expect;
import sessionHandler from '../../src/sessionHandler.js';
import User from '../../src/models/user.js';
import session from 'express-session';
import { mockRequest, mockResponse } from 'mock-req-res';
import assert from 'assert';
import express from 'express';

import FileStore from 'session-file-store';
const SessionFileStore = FileStore(session);


/*
describe('Testing session functions', function() {
    it('test if user gets stored in session', async function(done) {
        let mockRequest = {
            req : {
                session : {loggedIn: false, userid: 0, username: '', firstname: '', lastname: '', pw: ''}
            }   
        };
        let user = new User(1, 'testuser', 'testfirstname', 'testlastname', 'testpw', 'testemail');
        //let req = mockRequest(); // req.session 
        //let res = mockResponse().mockResponse;
        let test = await sessionHandler.setUserToSession(mockRequest.req, null, user);
        
        //TODO: how do i test it correctly?
        //should i return a user object or check what the values are in req.session?
        //assert.strictEqual(test, true);
        expect(test).to.equal(1);
        done();
    });
});*/
