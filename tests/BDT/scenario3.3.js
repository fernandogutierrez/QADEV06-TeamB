var init     = require('../../init');
var expect   = require('chai').expect;
var ObjectId = require('mongodb').ObjectID;

var RequireServices = require(GLOBAL.initialDirectory + '/lib/req-serv.js').RequireServices;
var requireServices = new RequireServices();

var config         = requireServices.config();
var tokenAPI       = requireServices.tokenAPI();
var roomManagerAPI = requireServices.roomManagerAPI();
var util           = requireServices.util();
var getEndPoint    = requireServices.endPoint();
var mongodb        = requireServices.mongodb();
var roomJson       = requireServices.room();
var resourceConfig = requireServices.resourceConfig();
var meetingsConfig = requireServices.meetingConfig(); 
var outOfOrderConfig = requireServices.outOfOrder();

/* out of order*/     	
var outOfOrderbyIDEndPoint     = config.url + getEndPoint.getOutOfOrder;
var outOfOrderbyServiceEndPoint = config.url + getEndPoint.getOutOfOrderbyService;
//resource
var resourceEndPoint = config.url + getEndPoint.resources;
var url = config.url;
//locations
var locationConfig = requireServices.locationConfig();
var endPoint       = config.url + getEndPoint.locations;
var endPointById   = config.url + getEndPoint.locationById;
var size           = locationConfig.size;
//meting 
var servicesEndPoint = url + getEndPoint.services;
var basic    = config.userBasicAccountJson;
var rooms    = getEndPoint.rooms;
var meetings = getEndPoint.meetings;

var timeout  = config.timeOut;
//global variables
var endPointOutOfOrder, resourceId,room, roomId, serviceId, 
token, locationID, endPointLocationById, locationJson, 
outOforderId, meeting, meetingId, roomEmail, locationName;

describe('Scenario 3.3 – Create a meeting in a room associated to location later put out of order ', function () {
	this.timeout(timeout);

	context('Given a room out of order e.g roomA ',function(){
		before('get the token of the roomManager', function(done) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			tokenAPI
				.getToken(function(err,res){
					token = res.body.token;
					done();
				});
		});	
		before('return  the room of roomManager',function(done) {	
			mongodb.findDocument('rooms',meetingsConfig.displayName,function(res){
				room = res;
				roomId= res._id;
				done();
			});
		});
		before(function(done) {
			console.log('\t \t And an location eg. floor1 is created');
			locationJson = util.generateLocationJson(size.nameSize,size.customNameSize,size.description);
		    	roomManagerAPI

					.post(token,endPoint,locationJson,function (err,res) {
						locationID = res.body._id;
						locationName = res.body.customName;
						endPointLocationById = util.stringReplace(endPointById, locationConfig.locationIdReplace, locationID);
						done();
					});
		});

		after('delete a locations ',function(done) {
			roomManagerAPI

			  .del(token,endPointLocationById,function (err,res) {
			  	 	done();
			  });

		});	
		before( function(done){
			console.log('\t \t And the floor1 is associated to roomA');
			associateLocation = { "locationId" :locationID};
			var associateEndPointL = url + '/rooms/'+roomId;

			  roomManagerAPI
				.put(token,associateEndPointL,associateLocation, function(err, res){
					done();
				});				
		});
		describe('When you want to create a meeting in the roomA \n', function () {
			
			after('delete the meeting ',function (done) {
				var _endPointMeeting = servicesEndPoint + '/' + room.serviceId +
				                       '/' + rooms + '/' + roomId + '/' + meetings +
				                        '/' + meetingId;
					roomManagerAPI
						.delwithBasic(basic, _endPointMeeting, function(err, res){
							done();
						});
			});		
			after('delete the out of order of the roomA',function(done){
				endPoint1 = util.stringReplace(outOfOrderbyServiceEndPoint,config.nameId.serviceId,room.serviceId);
				endPoint2 = util.stringReplace(endPoint1,config.nameId.roomId,room._id);
				endPoint = util.stringReplace(endPoint2,config.nameId.outOfOrderId,outOforderId);	
				roomManagerAPI
					.del(token,endPoint,function(err,res){
						done();
					});				
			});

			it('then the meeting must be created in a specific date', function(done) {
				var num = room.displayName.substring(10);
				meetingsConfig.meetingJSon.location = room.displayName;
				meetingsConfig.meetingJSon.roomEmail = room.emailAddress
				meetingsConfig.meetingJSon.start = util.getDate(4);
		   		meetingsConfig.meetingJSon.end = util.getDate(5);

		   		//I created this variable to store the associated endPoint
				associateEndPointM = servicesEndPoint + '/' + room.serviceId + 
				                     rooms + '/' + roomId + meetings;

				roomManagerAPI
					.postwithBasic(basic,associateEndPointM, meetingsConfig.meetingJSon, function(err, res){
						meetingId = res.body._id;
				            var json = {"_id" : ObjectId(res.body._id)}
						    mongodb
						        .findDocument('meetings', json, function(res1){
									meeting = res1;
									meetingId = res.body._id;
									expect(res.status).to.equal(config.httpStatus.Ok);
									expect(res.body).to.have.property("serviceId");
									expect(res.body.serviceId).to.equal(meeting.serviceId);
									expect(res.body).to.have.property("roomId");
									expect(res.body.roomId).to.equal(meeting.roomId);
									expect(res.body).to.have.property("roomEmail");
									expect(res.body.roomEmail).to.equal(meeting.roomEmail);
									expect(res.body).to.have.property("start");
									expect((new Date(res.body.start)).toGMTString()).to.equal((new Date(meeting.start)).toGMTString());
									expect(res.body).to.have.property("end");
									expect((new Date(res.body.end)).toGMTString()).to.equal((new Date(meeting.end)).toGMTString());
									expect(res.body).to.have.property("location");
									expect(res.body.location).to.equal(meeting.location);
									expect(res.body).to.have.property("title");
									expect(res.body.title).to.equal(meeting.title);
									done();
						});
					});
			});

			it('And put out of order the roomA in the same date of the meeting', function(done){
				endPoint1 = util.stringReplace(outOfOrderbyIDEndPoint,config.nameId.serviceId,room.serviceId);
				endPointOutOfOrder = util.stringReplace(endPoint1,config.nameId.roomId,room._id);
				outOfOrderConfig.bdtJson.roomId = roomId;
				associateOutOfOrder = outOfOrderConfig.bdtJson;

				roomManagerAPI
				    .post(token, endPointOutOfOrder, associateOutOfOrder,function(err,res){
						result = res;
							mongodb
							   .findDocument('outoforders',res.roomId,function(res){	
							   		expect(result.status).to.equal(config.httpStatus.Ok);
									expect(result.body).to.not.be.null;
									done();	

					});
				});					
			});
		});
	});	
});