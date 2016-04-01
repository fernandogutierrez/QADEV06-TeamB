/*
Scenario 4 – The same room should not be associated at two different locations
	Given there is a main location 'Fundacion Jala' created
		And a 2 sub-locations  'Floor2' and 'Floor3' created
		And the sub-locations have a parent location 'Fundacion Jala'
	When the room 'B4C3' is associated at the location 'Floor2' 
		And  the same room 'B4C3' is associated at the location 'Floor3'
    Then room 'B4C3' should not be associated at location 'Floor3'
*/

var init = require('../../init');
var expect = require('chai').expect;

var RequireServices = require(GLOBAL.initialDirectory + '/lib/req-serv.js').RequireServices;
var requireServices = new RequireServices();

var roomManagerAPI = requireServices.roomManagerAPI();
var locationConfig = requireServices.locationConfig();
var tokenAPI  = requireServices.tokenAPI();
var endPoints = requireServices.endPoint();
var util   = requireServices.util();
var config = requireServices.config();
var mongoDB = requireServices.mongodb();
var roomConfig = require(GLOBAL.initialDirectory + config.path.room);

//global variables

var endPoint = config.url + endPoints.locations;
var endPointRoom = config.url + endPoints.room;
var endPointById = config.url + endPoints.locationById;
var size = locationConfig.size;

var token, parentLocation, subLocation1, subLocation2, 
parentId, locationJson, allLocations, jsonRoom, room1, room2;

var quantityOfLocation = 0;

describe('Scenario 4 – The same room should not be associated at two different locations', function (done) {
		this.timeout(config.timeOut);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
	context('Given there is a main location \'Fundacion Jala\' created',function(){

		before('Given there is a main location \'Fundacion Jala\' created',function (done) {		
		//getting the token
			tokenAPI
				.getToken(function(err,res){
					token = res.body.token;
					locationJson = locationConfig.locationJson;
					locationJson.name = "FundacionJala";
					locationJson.customName = "FundacionJala";
					locationJson.description = "Main building";
					roomManagerAPI
						.post(token,endPoint,locationJson,function (err,res) {	
							parentLocation = res;
							done();				
					});
			});	
		});

		
		before('And a 2 sub-locations  \'Floor2\' and \'Floor3\' created',function(done) {
			console.log('\tAnd a 2 sub-locations  \'Floor2\' and \'Floor3\' created');
			console.log('\tAnd the sub-locations have a parent location \'Fundacion Jala\'');
			//created a sub-location 'Floor2' and 'Floor1' based in the location's _id
			// of main location (parentId) 'FundacionJala'
			parentId = parentLocation.body._id;
			locationJson.parentId = parentId;
			locationJson.name = 'Floor2';
			locationJson.customName = 'Floor2';
			locationJson.description = 'Sub-Location of Main location';
			
			roomManagerAPI
						.post(token,endPoint,locationJson,function (err,res) {	
							locationJson.parentId = parentId;
							locationJson.name = 'Floor3';
							locationJson.customName = 'Floor3';
							locationJson.description = 'Sub-Location2 of Main location';
							subLocation1 = res;
							roomManagerAPI
								.post(token,endPoint,locationJson,function(err,res){
									subLocation2 = res;
									done();
								});
				});
		});

		
		before('Getting all locations created',function (done) {
			
			roomManagerAPI.get(endPoint,function(err,res){
				allLocations = res.body;
				done();
			});

		});

		before('And select two rooms',function(done) {
			console.log('\tAnd select two rooms in order to associate a Location');					
			jsonRoom = roomConfig.roomQueries.displayName;

              mongoDB
			    .findDocument('rooms', jsonRoom, function(room){
					jsonRoom.displayName = "Floor1Room99";
					room1 = room;
					mongoDB
					  .findDocument('rooms',jsonRoom,function(room){
						 room2 = room;
						 done();
				    });
			});
			
		});

		after('Delete all locations have been created',function (done) {
            var _endPoint = endPoint + '/' + allLocations[i]._id;
			var count = 0;
			for (var i = 0; i < allLocations.length; i++) {
				roomManagerAPI
					.del(token, _endPoint, function(err,res){
						count++;
							if(count == allLocations.length){
								done();
							};
					});
			};

		});

		describe('When the room \'Floor1Room1\' is associated at the location \'Floor2\' ', function () {

			describe('\tAnd  the same room \'Floor1Room2\' is associated at the location \'Floor2\'', function () {

				it('Then room \'Floor1Room2\' should not be associated at location \'Floor3\'', function (done) {

					endPointRoom = endPointRoom + '/' + room1._id;
					jsonRoomUpdate = { "locationId" : subLocation1.body._id};
					      roomManagerAPI
								.put(token,endPointRoom,jsonRoomUpdate, function(err,res){

									endPointRoom = endPointRoom + '/' + room2._id;

									jsonRoomUpdate = { "locationId" : subLocation2.body._id};

									roomManagerAPI
										.put(token,endPointRoom,jsonRoomUpdate,function(err,resp){
											expect(resp.status).to.equal(404);
											done();
									});
					});

				});
			});
		});	

	});	
});
