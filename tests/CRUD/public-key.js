
var expect = require('chai').expect;
//import libraries
var init = require('../../init');
var config = require(GLOBAL.initialDirectory+'/config/config.json');
//I added req-serv.js into node_modules
var RequireServices = require('req-serv.js').RequireServices;
var requireServices = new RequireServices();

//var endPoints = requireServices.endPoint();
var roomManagerAPI = requireServices.roomManagerAPI();
var publicKey = requireServices.publicKey();

//url
var publicKeyEndPoint = requireServices.publicKeyEndPoint(); 

//declare variables for structure of the key
var publicKeyBegin = publicKey.publicKeyStructure.publicKeyBegin; 
var publicKeyVersion = publicKey.publicKeyStructure.publicKeyVersion;
var publicKeyEnd = publicKey.publicKeyStructure.publicKeyEnd;
var publicKeyType = publicKey.publicKeyType;

//variables of endblockkey
var endBlocKeyBegin = publicKey.endKeyBlock.begin;
var endBlocKeyEnd = publicKey.endKeyBlock.end;



describe('Smoke TC PGP public-key', function () {

	before(function (done) {
		this.timeout(config.timeOut);
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		done();
	});	

	it('Verify that the public-key contains an begin block, version, end block', function(done) {		  
						 
		roomManagerAPI
			.get(publicKeyEndPoint, function(err, res){	
				//getting substrings of public-key
				var cadena = res.body.content;
				//assersions begin, version, end block of the key
				expect(publicKeyType).to.equal(res.body.type);
				expect(publicKeyBegin).to.equal(cadena.substring(publicKey.beginKeyBlock.begin, publicKey.beginKeyBlock.end));
				expect(publicKeyVersion).to.equal(cadena.substring(publicKey.keyVersion.begin, publicKey.keyVersion.end));
				var endBlock = cadena.substring(cadena.length - endBlocKeyBegin, cadena.length - endBlocKeyEnd);
				expect(publicKeyEnd).to.equal(endBlock);

				done();
			});
	});

	it('GET /public-key ', function (done) {
		roomManagerAPI
			.get(publicKeyEndPoint, function(err, res){	
				expect(res.status).to.equal(config.httpStatus.Ok);
				expect(res.body).to.have.property("type");
				expect(res.body.type).to.equal("text");
				expect(res.body).to.have.property("content");

				done();
			});
	});
});