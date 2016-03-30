//Smoke TC Resources
//Jean Carlo Rodriguez
// the next line call the file init.js to declare a global var(GLOBAL.initialDirectory)
/*Modified by Maria Eloisa Alcocer Villarroel*/
var init          = require('../../init.js');
var expect        = require('chai').expect;
var RequireServices = require(GLOBAL.initialDirectory+'/lib/req-serv.js').RequireServices;
var requireServices = new RequireServices();
var config        = requireServices.config();
var serviceConfig = require(GLOBAL.initialDirectory+config.path.serviceConfig);

var resourceConfig = requireServices.resourceConfig();
var tokenAPI = requireServices.tokenAPI();
var roomManagerAPI = requireServices.roomManagerAPI();
var endPoints = requireServices.endPoint();
var util = requireServices.util();

//endPoints
var resourceEndPoint = requireServices.resourceEndPoint();

// global variables
var token = null; 

describe('Resources Smoke tests', function () {
	this.timeout(config.timeOut);
	//Before
	before(function (done) {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		//getting the token
		tokenAPI
			.getToken(function(err, res){
				token = res.body.token;
				done();
			});
	});
	

	it('Get /Resources', function (done) {
		
		roomManagerAPI
			.get(resourceEndPoint,function(err, res){
				expect(res.status).to.equal(config.httpStatus.Ok);
				done();
			});
	});

	describe('set of tests that is need to after delete a resource', function () {
		var resourceId = null;
		after(function (done) {
			//delete the resource
			if(resourceId != null)
			{
				roomManagerAPI
					.del(token,resourceEndPoint + '/' + resourceId,function(err, res){
						resourceId = null;
						done();
					});
			}else{
				console.log('the resourceID is null (after)');
			}
		});

		it('Post /resources', function (done) {
			
			var resourceJSon = util.getRandomResourcesJson(resourceConfig.resourceNameSize);
			roomManagerAPI
				.post(token, resourceEndPoint,resourceJSon,function(err,res){
					resourceId = res.body._id;
					expect(res.status).to.equal(config.httpStatus.Ok);
					done();
				});
		});
	});
	

	describe('set of tests that is need to before create and after delete a resource', function () {
		var resourceId = null;
		
		beforeEach(function (done) {
			//create a resource
			var resourceJSon = util.getRandomResourcesJson(resourceConfig.resourceNameSize);
			roomManagerAPI
				.post(token,resourceEndPoint,resourceJSon,function(err,res){
					resourceId = res.body._id;
					done();
				});
		});
		
		afterEach(function (done) {
			//delete the resource
			if(resourceId!=null)
			{
				roomManagerAPI
					.del(token, resourceEndPoint + '/' + resourceId,function(err, res){
						resourceId = null;
						done();
					});
			}else{
				console.log('the resourceID is null (after)');
			}
		});
		
		it('Get /resources/{id}', function (done) {

			roomManagerAPI
				.get(resourceEndPoint + '/' + resourceId, function(err, res){
					expect(res.status).to.equal(config.httpStatus.Ok);
					done();
				});
		});
		
		it('Put /resources/{id}', function (done) {
			var resourcePutJSon = util.getRandomResourcesJson(resourceConfig.resourceNameSize);
			roomManagerAPI
				.put(token,resourceEndPoint + '/' + resourceId, resourcePutJSon, function(err, res){
					expect(res.status).to.equal(config.httpStatus.Ok);
					done();
				});
		});
	});

	describe('set of tests that is need to before create a resource', function () {
		var resourceId = null;
		
		beforeEach(function (done) {
			//create a rosource
			var resourceJSon = util.getRandomResourcesJson(resourceConfig.resourceNameSize);
			roomManagerAPI
				.post(token,resourceEndPoint,resourceJSon,function(err, res){
					resourceId = res.body._id;
					done();
				});
		});
		
		it('Delete /resources/{id}', function (done) {
			roomManagerAPI
				.del(token,resourceEndPoint + '/' + resourceId, function(err, res){
					expect(res.status).to.equal(config.httpStatus.Ok);
					done();
				});
		});
		
		/*This test case was added 03/26/2016*/
		it('Delete /resources', function (done){
			roomManagerAPI
				.delWithParam(token, resourceEndPoint, resourceId, function(err, res){
					expect(res.status).to.equal(config.httpStatus.Ok);
					done();
				});
		});
	});
});