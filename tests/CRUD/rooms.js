/*
room.js
CRUD test
author: Andres Uzeda
*/
//libs
var init = require('../../init');
//var init = require('../init');
var expect = require('chai').expect;
var should 		  = require('chai').should();
var RequireServices = require(GLOBAL.initialDirectory+'/lib/req-serv.js').RequireServices;
var requireServices = new RequireServices();
var config =require(GLOBAL.initialDirectory+'/config/config.json');
var roomJson = require(GLOBAL.initialDirectory+'/config/room.json');
//services
var tokenAPI = requireServices.tokenAPI();
var roomManagerAPI = requireServices.roomManagerAPI();
var mongodb = requireServices.mongodb();
var endPoints	=	requireServices.endPoint();
var resourceConfig = requireServices.resourceConfig();
var util = requireServices.util();
var compareProp = requireServices.compareResults();
//variables
var token=null;
var room=null;
var resource=null;
var json=null;
var resourceAsoc=null;
var endPoint=null;
var endPoint2=null;
var meetingId = null;
var jsonMeeting = null;
var num =  null;
/*TESTS*/
describe('CRUD Testing for Room routes', function() {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	this.timeout(config.timeOut);

	/**
	 * Pre condition to execute the set Test Cases.
	 * @getToken(rollback)
	 * Obtain a token to an user account setting in the config.json file,
	 * Get a room of mongodb
	 */
	before('Preconditions',function (done) {	
		tokenAPI
			.getToken(function(err,res){
				token = res.body.token;
				endPoint=config.url+endPoints.rooms;
				json=roomJson.roomQueries.displayName;
				mongodb.findDocument('rooms',json,function(doc){
					room=doc;
					done();
				});						
			});
	});

	after('Post conditions : restore the properties of the rooms changed ',function (done) {
		endPoint=config.url+endPoints.rooms+'/'+room._id;
			json.customDisplayName="Floor1Room1";
			roomManagerAPI.
				put(token,endPoint,json,function(err,res){
					done();
				});			
	});

/**
 * this test verifies that API returns all rooms
 */
	it('Get /rooms api returns all rooms',function(done){
		roomManagerAPI.
			get(endPoint,function(err,res){
				mongodb.findDocuments('rooms',function(doc){
				rooms=doc;
				expect(err).to.be.null;
				expect(res.status).to.equal(config.httpStatus.Ok);
				expect(res.body.length).to.equal(rooms.length);
				done();
				});
			});
	});	
/**
 * this test verifies that API returns the room specified
 */
	it('Get /rooms/{roomId} api returns the room specified ',function(done){	
		endPoint=endPoint+'/'+room._id;
		roomManagerAPI.
			get(endPoint,function(err,res){
				should.not.exist(err);
				expect(res.body._id).not.equal(null);
				verifyProp = compareProp.verifyProperties('rooms', res.body);
				expect(true).to.equal(verifyProp);
				compareProp.verifyValues('rooms', room._id, res.body, function(flag){
				expect(flag).to.equal(true);
				done();
				});
			});
	});	

/**
 *this test verifies that API returns the room modified
 */
	it('PUT /rooms/{roomId} api returns the room modified',function(done){	
		json.customDisplayName='ChangedByAPI';
		roomManagerAPI.
			put(token,endPoint,json,function(err,res){
				json=roomJson.roomQueries.displayName;
				should.not.exist(err);
				expect(res.body._id).not.equal(null);
				verifyProp = compareProp.verifyProperties('rooms', res.body);
				expect(true).to.equal(verifyProp);
				compareProp.verifyValues('rooms', room._id, res.body, function(flag){
				expect(flag).to.equal(true);
				done();
				});
			});	
	});
/*
* this Test to verify the service room with the method get for read the
* all meetings in room
*/
	it('Get /rooms/{roomId}/meetings, returns all meetings ',function(done){	
		endPoint=endPoint+'/meetings';
		roomManagerAPI.
			get(endPoint,function(err,res){
				expect(res.status).to.equal(config.httpStatus.Ok);
				mongodb.findDocuments('meetings',function(doc){
					rooms=doc;
					expect(err).to.be.null;
					expect(res.status).to.equal(config.httpStatus.Ok);
					done();
				});
			});
	});
/*
 * this Test to verify the service room with the method post for create the
 * meeting in room
*/
	it('POST /rooms/{roomId}/meetings, create the meeting in room',function(done){	
		num = displayName.substring(10);
		jsonMeeting = util.generatemeetingJson(num);
		roomManagerAPI.
			post(token,endPoint,jsonMeeting,function(err,res){
				mongodb.findDocuments('meetings',function(doc){
				expect(res.status).to.equal(config.httpStatus.Ok);
				rooms=doc;
				expect(err).to.be.null;
				done();
				});
			});	
	});
/*
* this Test to verify the service room with the method get for read the
* meeting in room
*/
	it('Get /rooms/{:roomId}/meetings/{:meetingId}, read the meeting in room',function(done){	
			num = displayName.substring(10);
			jsonMeeting = util.generatemeetingJson(num);
			roomManagerAPI.
				post(token,endPoint,jsonMeeting,function(err,res){
					meetingId = res.body._id;
					get(endPoint+'/'+meetingId,function(er,re){
						mongodb.findDocuments('meetings',function(doc){
							rooms=doc;
							expect(err).to.be.null;
							expect(re.status).to.equal(config.httpStatus.Ok);
							done();
						});
					});
				});	
		});
/*
* This Test to verify the service room with the method put for updates the
* meeting in room
*/
	it('PUT rooms/{:roomId}/meetings/{:meetingId}, updates the meeting in room',function(done){	
			num = displayName.substring(10);
			jsonMeeting = util.generatemeetingJson(num);
			roomManagerAPI.
				post(token,endPoint,jsonMeeting,function(err,res){
					expect(res.status).to.equal(config.httpStatus.Ok);
					meetingId = res.body._id
					jsonMeeting.title = 'ChangedByAPI'
					put(token,endPoint+'/'+meetingId,jsonMeeting,function(er,re){
						mongodb.findDocuments('meetings',function(doc){
							rooms=doc;
							expect(err).to.be.null;
							expect(re.status).to.equal(config.httpStatus.Ok);
							done();
						});
					});
				});	
		});

});