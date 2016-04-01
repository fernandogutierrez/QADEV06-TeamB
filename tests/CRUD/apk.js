//CRUD TC apk router
//Miguel Angel Terceros Caballero

var expect = require('chai').expect;
//import libraries
var init = require('../../init');
//I added req-serv.js into node_modules
var RequireServices = require('req-serv.js').RequireServices;
var requireServices = new RequireServices();

var config = requireServices.config();
var endPoints = requireServices.endPoint();
var roomManagerAPI = requireServices.roomManagerAPI();
var apk = require(GLOBAL.initialDirectory+config.path.apk);
 

var apkEndPoint = config.url + endPoints.apk;

describe('CRUD TCs of APK Routers', function () {
	before(function (done) {
		this.timeout(config.timeOut);
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		done();
	});	

	it('verify that the service not exists', function(done) {
		roomManagerAPI
			.get(apkEndPoint, function(err, res){
				expect(res.status).to.equal(404);							
				expect(apk.apkError.code).to.equal(res.body.code);
				expect(res.body).to.have.property("code");
				expect(apk.apkError.message).to.equal(res.body.message);
				expect(res.body).to.have.property("message");

				done();
			});
	});
});