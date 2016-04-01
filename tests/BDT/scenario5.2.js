
var init = require('../../init');
var config = require(GLOBAL.initialDirectory+'/config/config.json');
var expect = require('chai').expect;
var ObjectId = require('mongodb').ObjectId;

var RequireServices = require(GLOBAL.initialDirectory + '/lib/req-serv.js').RequireServices;
var requireServices = new RequireServices();

var tokenAPI = requireServices.tokenAPI();
var roomManagerAPI = requireServices.roomManagerAPI();
var endPoint = requireServices.endPoint();
var locationConfig = requireServices.locationConfig();
var util = requireServices.util();
var mongodb = requireServices.mongodb();

//EndPoints
var meetingConfig = requireServices.meetingConfig();
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
    meetingId3, displayName, location, locationId, 
    endPointLocationById, locationJson;

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

	describe('Scenario 5.2: Create meetings at different time in a Room', function () {
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
						roomManagerAPI.
							put(token,roomsEndPoint + '/' + roomId, json, function(err,res){
								done();
							});
					});
			});

			before('And one meeting assigned at the Room', function(done){
				console.log('\t\tAnd one meeting assigned at the Room');
				var _endPointMeet = servicesEndPoint + '/' + serviceId + '/' + 
				                    rooms + '/' + roomId + '/' + meetings;

				var num = displayName.substring(10);
				var meetingJSon = util.generatemeetingJson(num);
				meetingJSon.start = meetingConfig.startMeeting;
				meetingJSon.end = meetingConfig.endMeeting;

				roomManagerAPI
					.postwithBasic(basic, _endPointMeet, meetingJSon, function(err, res){
						meetingId1 = res.body._id;
						done();
					});
			});

			after('Deleting The location, resources and meeting', function (done) {
				roomManagerAPI
				  	.del(token,endPointLocationById,function (err,res) {
						roomManagerAPI
						   var _endPoint = servicesEndPoint + '/' + serviceId + 
						                   '/' + rooms + '/' + roomId + '/' + 
						                   meetings + '/' + meetingId1;

							.delwithBasic(basic, _endPoint, function(err, res){
								meetingId1 = null;
								done();
							});
					});
			});

			describe('When a new meeting is assigned to same Room at different time', function () {
				after('deleting the new meeting', function (done) {
					//I created this variable to store the enpoint
					var _endPoint = servicesEndPoint + '/' + serviceId + '/' + 
					                rooms + '/' + roomId + '/' + meetings + '/' 
					                + meetingId2;

					roomManagerAPI
						.delwithBasic(basic, _endPoint, function(err, res){
							//I created this variable to store the enpoint
							var _endPointMeet = servicesEndPoint + '/' + serviceId 
							                  + '/' + rooms + '/' + roomId + '/' 
							                  + meetings + '/' + meetingId3;

							meetingId2 = null;
							roomManagerAPI
								.delwithBasic(basic, _endPointMeet, function(err, res){
									meetingId3 = null;
									done();
								});
						});
				});
				
				it('Then ensure that is possible assign more of one meeting to room at different time', function (done) {

					var num = displayName.substring(10);
					var meetingJSon = util.generatemeetingJson(num);
					meetingJSon.start = meetingConfig.startMeeting2;
					meetingJSon.end = meetingConfig.endMeeting2;

					// I added _endPointMeet variable for using in roomManagerAPI.postwithBasic
					var _endPointMeet = servicesEndPoint + '/' + 
					                    serviceId + '/' + rooms + '/' + 
					                    roomId + '/' + meetings;

					roomManagerAPI
						.postwithBasic(basic, _endPointMeet, meetingJSon, function(err, res){
							meetingId2 = res.body._id;
							expect(res.status).to.equal(config.httpStatus.Ok);
							expect(res.body).to.not.be.undefined;
							meetingJSon.start = meetingConfig.startMeeting3;
							meetingJSon.end = meetingConfig.endMeeting3;

							roomManagerAPI
								.postwithBasic(basic, _endPointMeet, meetingJSon, function(err, res1){
									meetingId3 = res1.body._id;
									expect(res1.status).to.equal(config.httpStatus.Ok);
									expect(res1.body).to.not.be.undefined;
									done();
								});
						});
				});
			});
		});
	});
});