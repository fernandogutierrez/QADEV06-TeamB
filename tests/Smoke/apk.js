
var expect = require('chai').expect;
//import libraries
var init = require('../../init');

//I added req-serv.js into node_modules
var RequireServices = require('req-serv.js').RequireServices;
var requireServices = new RequireServices();

var config = requireServices.config();
var endPoints = requireServices.endPoint();
var roomManagerAPI = requireServices.roomManagerAPI();

//url 
var apkEndPoint = config.url + endPoints.apk; 

describe('APK Routers', function () {

	before(function (done) {
		this.timeout(config.timeOut);
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		done();
	});	

	it('GET /apk refactor', function(done) {
		console.log(apkEndPoint);
		roomManagerAPI
			.get(apkEndPoint, function(err, res){	
				expect(res.status).to.equal(config.httpStatus.Ok);
				done();
			});
	});
});