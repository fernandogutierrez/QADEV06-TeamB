/*
room.js
smoke test
author: unknown
test modified by: Andres Uzeda
*/
//libs
var init = require('../../init');
var expect = require('chai').expect;
var RequireServices = require(GLOBAL.initialDirectory+'/lib/req-serv.js').RequireServices;
var requireServices = new RequireServices();
var config = requireServices.config();
var roomJson = require(GLOBAL.initialDirectory + config.path.room);
//services
var tokenAPI = requireServices.tokenAPI();
var roomManagerAPI = requireServices.roomManagerAPI();
var mongodb = requireServices.mongodb();
var endPoints	=	requireServices.endPoint();
var resourceConfig = requireServices.resourceConfig();
var util = requireServices.util();
//variables
var token,room,resource,json,resourceAsoc,endPoint,endPoint2;
var meetingId = null;
var jsonMeeting = null;
var num =  null;
var statusExpected = config.httpStatus.Ok;

/*TESTS*/
describe('Smoke Testing for Room routes', function() {
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
				endPoint = config.url + endPoints.rooms;
				json = roomJson.roomQueries.displayName;
				mongodb.findDocument('rooms',json,function(doc){
					room = doc;
					done();
				});						
			});
	});

	after('Post conditions : restore the properties of the rooms changed ',function (done) {
		endPoint = config.url + endPoints.rooms + '/' + room._id;
			json.customDisplayName = "Floor1Room2";
			roomManagerAPI.
				put(token,endPoint,json,function(err,res){
					done();
				});			
	});

/**
 * Smoke Test to the service room with the method get.
 * Test : Get all rooms and validate the status.
 */
	it('Get /rooms , Verify the status 200',function(done){
		roomManagerAPI.
			get(endPoint,function(err,res){
				expect(res.status).to.equal(statusExpected);
				done();
			});
	});	
/**
 * Smoke Test to the service room with the method get for getting a
 * specific room by roomId.
 */
	it('Get /rooms/{roomId}, Verify the status 200 ',function(done){	
		endPoint = endPoint + '/' + room._id;
		roomManagerAPI.
			get(endPoint,function(err,res){
				expect(res.status).to.equal(statusExpected);
				done();
			});
	});	

/**
 * Smoke Test to the service room with the method put for modify the
 * display name of the room 
 */
	it('PUT /rooms/{roomId}, Verify the status 200',function(done){	
		json.customDisplayName = 'ChangedByAPI';
		roomManagerAPI.
			put(token,endPoint,json,function(err,res){
				expect(res.status).to.equal(statusExpected);
				done();
			});	
	});
/*
* Smoke Test to the service room with the method get a meetings
*/
	it('Get /rooms/{roomId}/meetings, Verify the status 200 ',function(done){	
		endPoint = endPoint + '/meetings';
		roomManagerAPI.
			get(endPoint,function(err,res){
				expect(res.status).to.equal(statusExpected);
				done();
			});
	});
/**
 * Smoke Test to the service room with the method post for create the
 * meeting in room
 */
	it('POST /rooms/{roomId}/meetings, Verify the status 200',function(done){	
		num = displayName.substring(10);
		jsonMeeting = util.generatemeetingJson(num);
		roomManagerAPI.
			post(token,endPoint,jsonMeeting,function(err,res){
				expect(res.status).to.equal(config.httpStatus.Ok);
				done();
			});	
	});
/*
* Smoke Test to the service room with the method get for read the
* meeting in room
*/
	it('GET /rooms/{:roomId}/meetings/{:meetingId}, Verify the status 200',function(done){	
			num = displayName.substring(10);
			jsonMeeting = util.generatemeetingJson(num);
			roomManagerAPI.
				post(token,endPoint,jsonMeeting,function(err,res){
					meetingId = res.body._id;
					get(endPoint+'/'+meetingId,function(er,re){
						expect(re.status).to.equal(config.httpStatus.Ok);
						done();
					});
				});	
		});
/*
* Smoke Test to the service room with the method put for updates the
* meeting in room
*/
	it('PUT rooms/{:roomId}/meetings/{:meetingId}, Verify the status 200',function(done){	
			num = displayName.substring(10);
			jsonMeeting = util.generatemeetingJson(num);
			roomManagerAPI.
				post(token,endPoint,jsonMeeting,function(err,res){
					expect(res.status).to.equal(config.httpStatus.Ok);
					meetingId = res.body._id
					jsonMeeting.title = 'ChangedByAPI'
					put(token,endPoint+'/'+meetingId,jsonMeeting,function(er,re){
						expect(re.status).to.equal(config.httpStatus.Ok);
						done();
					});
				});	
		});
});

describe('Smoke Testing for Room Resources routes ', function() {
	this.timeout(config.timeOut);

	/**
	 * Pre condition to execute the set Test Cases.
	 * @getToken(rollback)
	 * Obtain a token to an user account setting in the config.json file,
	 * Get a room randomly and create a resource
	 */
	before('Before Set',function (done) {
		tokenAPI
			.getToken(function(err,res){
				token = res.body.token;
				endPoint = config.url + endPoints.rooms;
				mongodb.findDocument('rooms',json,function(doc){
						room = doc;
						endPoint2 = config.url + endPoints.resources;
						json = util.getRandomResourcesJson(resourceConfig.resourceNameSize);
							roomManagerAPI.post(token,endPoint2,json,function(err,resourceRes){
								resource = resourceRes;
								 	endPoint = endPoint + '/' + room._id + '/resources';	
								 	json = roomJson.resources.roomsAsoc;	
									json.resourceId = resource.body._id;
										roomManagerAPI.post
											(token,endPoint,json,function(err,resAsoc){
											resourceAsoc = resAsoc;
											done();
									});									
							});	
					});				
			});		
	});

	after('Before Set',function (done) {
		endPoint = config.url + endPoints.resources + '/' + resource.body._id;
		roomManagerAPI
			.del(token,endPoint,function(err,resourceDel){
				done();	
			});	
	});
/**
 * Smoke Test to the service room with the method get the
 * resources of the all rooms 
 */
	it('GET /rooms/{roomId}/resources,Verify the status 200',function(done){	
			roomManagerAPI.get(endPoint,function(err,res){
				expect(res.status).to.equal(statusExpected);
				done();
			});			  				  			 						
	});	
/**
 * Smoke Test to the service room with the method post for creates the
 * resources in the room 
 */
	it('POST rooms/{:roomId}/resources, Verify the status 200',function(done){		
		expect(resourceAsoc.status).to.equal(statusExpected);
  		done();
	});

/**
 * Smoke Test to the service room with the method get for read the
 * display resources of the room 
 */
	it('GET /rooms/{:roomId}/resources/{:roomResourceId}, Verify the status 200',function(done){													
			endPoint = endPoint + '/' + resourceAsoc.body.resources[0]._id;
			roomManagerAPI.get(endPoint,function(err,res){
				expect(res.status).to.equal(statusExpected);	
				done();
			})
	});	

 /**
 * Smoke Test to the service room with the method PUT
 * for Updating a specific resource from a specific room
 */			
	it('PUT /rooms/{:roomId}/resources/{:roomResourceId}, Verify the status 200',function(done){		
			 json = roomJson.roomQueries.resourcesUpdate;
			roomManagerAPI.put(token,endPoint,json,function(err,res){
				expect(res.status).to.equal(statusExpected);	
				done();		
			});
	});	
	
 /**
 * Smoke Test to the service room with the method DEL
 * for Removing a specific resource from a specific room
 */	
	it('DELETE /rooms/{:roomId}/resources/{:roomResourceId}, Verify the status 200 ',function(done){	
		 roomManagerAPI.del(token,endPoint,function(err,res){
		 	expect(res.status).to.equal(statusExpected);	
			done();			
		 });						
	});	

});

