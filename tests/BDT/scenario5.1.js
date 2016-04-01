var init = require('../../init');
var expect = require('chai').expect;

var RequireServices = require(GLOBAL.initialDirectory + '/lib/req-serv.js').RequireServices;
var requireServices = new RequireServices();

var config = requireServices.config();
var tokenAPI = requireServices.tokenAPI();
var roomManagerAPI = requireServices.roomManagerAPI();
var endPoint = requireServices.endPoint();
var locationConfig = requireServices.locationConfig();
var util = requireServices.util();
var mongodb= requireServices.mongodb();

var meetingConfig = require(GLOBAL.initialDirectory+config.path.meetingConfig);
var ObjectId = require('mongodb').ObjectId;
//EndPoints
var url = config.url;
var endPointById = url + endPoint.locationById;
var meetingsEndPoint = url + endPoint.meetings;
var servicesEndPoint = url + endPoint.services;
var roomsEndPoint = url + endPoint.rooms;
var resourceEndPoint = url + endPoint.resources;
var endPointlocation = url + endPoint.locations;
//global variables
var rooms = endPoint.rooms;
var meetings = endPoint.meetings;
var basic = config.userBasicAccountJson;
var size = locationConfig.size;
var locationJsonId = locationConfig.locationIdForMongo;

var token, serviceId, roomId, meetingId1, meetingId2, 
	displayName, location, locationId, 
	endPointLocationById, locationJson ,response;

describe('meetings', function () {
	this.timeout(config.timeOut);
	before('Geeting the token', function (done) {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

		tokenAPI
			.getToken(function(err,res){
				token = res.body.token;
				var json = meetingConfig.displayName;
				mongodb
					.findDocument('rooms', json, function(res2){
						roomId = res2._id;
						serviceId = res2.serviceId;
						displayName = res2.displayName;
						done();
					});
			});
	});

	describe('Scenario 5.1: Create meetings at the same time', function () {
		context('Given I have a Room', function(){
			before('And a location assigned at to Room', function (done) {
				console.log('\t\tAnd a location assigned at to Room');
				locationJson = util.generateLocationJson(size.nameSize,size.customNameSize,size.description);
				roomManagerAPI
					.post(token,endPointlocation,locationJson,function (err,res) {
						location = res.body;
						locationId = res.body._id;
						endPointLocationById = util.stringReplace(endPointById,locationConfig.locationIdReplace,location._id);
						meetingConfig.locationId.locationId = locationId;
						var json = meetingConfig.locationId;
						// I create this method to store the end Point
						var _endPoint = roomsEndPoint + '/' + roomId;
						roomManagerAPI.
							put(token, _endPoint, json, function(err,res){
								done();
							});
					});
			});

			before('And one meeting assigned at the Room', function(done){
				console.log('\t\tAnd one meeting assigned at the Room');
				var num = displayName.substring(10);
				var meetingJSon = util.generatemeetingJson(num);
				
					meetingJSon.start = meetingConfig.startMeeting.substring(0,19);
					meetingJSon.end = meetingConfig.endMeeting.substring(0,19);
                // I create this method to store the end Point
                var _endPoint = servicesEndPoint + '/' + 
                                serviceId + rooms + '/' + 
                                roomId + meetings;

						roomManagerAPI
							.postwithBasic(basic,_endPoint, meetingJSon, function(err, res){
								
                                meetingId1 = res.body._id;

								done();
							});
			});

			after('Deleting The location, resources and meeting', function (done) {
				// I create this method to store the end Point
               var _endPoint = servicesEndPoint + '/' + serviceId + rooms 
                                + '/' + roomId + meetings + '/' + meetingId1;

               
				roomManagerAPI
					.del(token,endPointLocationById, function (err,res) {
                        
						roomManagerAPI
							.delwithBasic(basic, _endPoint, function(err, res){
								meetingId1 = null;
								done();
							});
				  	});
			});

			describe('When a new meeting is assigned to Room at the same Time', function () {
				
				it('Then ensure that is not possible assign the new meeting to room at the same time', function (done) {
					var num = displayName.substring(10);
					var meetingJSon = util.generatemeetingJson(num);
				 // I create this method to store the end Point
					var _endPoint = servicesEndPoint + '/' + serviceId + '/' 
					                + rooms + '/' + roomId + '/' + meetings;

					meetingJSon.start = meetingConfig.startMeeting;
					meetingJSon.end = meetingConfig.endMeeting;
                      
					roomManagerAPI
						.postwithBasic(basic, _endPoint, meetingJSon, function(err, res){
							response = res;
							meetingId2 = response.body._id;
							expect(response.status).to.equal(403);
							done();
						});
				});
				
				it('And returns an error', function (done) {
					expect(response.body).to.have.property('code')
					.and.be.equal('ConflictingMeetingError');
					expect(response.body).to.have.property('message')
					.and.be.equal('The meeting is conflicting with previously created meetings');
					done();
				});
			});
		});
	});
});