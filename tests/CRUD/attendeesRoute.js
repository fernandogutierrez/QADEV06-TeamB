/**
 * CRUD of Attendees Route by: Jose Antonio Cardozo
 */
//libs
var init = require('../../init');
var expect = require('chai').expect;
var RequireServices = require(GLOBAL.initialDirectory+'/lib/req-serv.js').RequireServices;
var requireServices = new RequireServices();
//services
var config = requireServices.config();
var tokenAPI = requireServices.tokenAPI();
var endPoints = requireServices.endPoint();
var roomManagerAPI = requireServices.roomManagerAPI();
var mongoDB = requireServices.mongodb();
var locationConfig = requireServices.locationConfig();
//variables
var token = null;
var endPointServices = config.url + endPoints.services;
var endPointById = config.url + endPoints.attend;
var ObjectId = require('mongodb').ObjectID;
var servicesId = locationConfig.locationIdForMongo;
/*TEST*/
describe('CRUD testing attendees route', function() {
	this.timeout(6000);
	before(function (done) {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		tokenAPI
			.getToken(function(err,res){
				token = res.body.token;
				done();
			});
	});
/*
* This Test to verify the service with the method get for read the
* attendees in meeting
*/
	it('Get /services/{servicesId}/attendees?filter=....', function (done) {
		
	  roomManagerAPI
		.getwithToken(token,endPointServices, function (err,res) {
			expect(res.status).to.equal(config.httpStatus.Ok);
			var servicesID = res.body[0]._id;
			var endPointServicesById = endPointById.replace('{:serviceId}',servicesID);
			roomManagerAPI
			  .get(endPointServicesById,function (err,res) {
			 	 expect(res.status).to.equal(config.httpStatus.Ok);
			 	 for (var i = 0; i < res.body.length; i++) {
			 	 	var servicesAttend = res.body[i];
			 	 	mongoDB
			 	 	.findDocument('services',servicesId,function (res) {
			 	 		expect(res).to.not.be.null;
			 	 		expect(servicesAttend.displayName).to.equal(res.body.displayName);
			 	 		expect(servicesAttend.mail).to.equal(res.body.mail);
			 	 	});
			 	 };
			 	 done();
			 });
		});
	});
});