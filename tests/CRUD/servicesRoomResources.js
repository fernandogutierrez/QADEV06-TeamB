var init            = require('../../init');

var RequireServices = require(GLOBAL.initialDirectory+'/lib/req-serv.js').RequireServices;
var requireServices = new RequireServices();
var expect          = require('chai').expect;
//services
var config        = requireServices.config();

var tokenAPI       = requireServices.tokenAPI();
var roomManagerAPI = requireServices.roomManagerAPI();

var util           = requireServices.util();
var mongodb        = requireServices.mongodb();

//config
var endPoints      = requireServices.endPoint();
var resourceConfig = requireServices.resourceConfig();
var roomResource   = requireServices.roomResource();

//End Points
var url              = requireServices.url();
var servicesEndPoint = requireServices.servicesEndPoint();
var roomsEndPoint    = requireServices.roomsEndPoint();
var resourceEndPoint = requireServices.resourceEndPoint();


var resources = endPoints.resources;
var rooms     = endPoints.rooms;

var arrayProperties = ['_id','emailAddress','displayName','serviceId',
						'resources','customDisplayName','enabled','locationId'];


// global variables
var room,token,idService,idRoom,
    idResourceCreate,resourceJSon,
    associateResource,idLastResource,
    endPointFinal,roomJSON,size,enPointRes;

var statusExpected = config.httpStatus.Ok;

describe('CRUD test for RoomResources',function(){
	this.timeout(config.timeOut);
	before(function (done) {
				
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		//getting the token
		tokenAPI
			.getToken(function(err,res){
				token = res.body.token;	
				//getting serviceID
				roomManagerAPI
					.getwithToken(token, servicesEndPoint, function(err, resp){
						idService = resp.body[0]._id;

						done();			
					});							
			});
	});

	after('After to create tests',function(done)
	{
		token = null;
		done();
	});

	beforeEach(function (done) {		
		//getting roomID
		roomManagerAPI
			.get(roomsEndPoint, function(err, res){
				idRoom = res.body[0]._id;//id room				
				resourceJSon = util.getRandomResourcesJson(resourceConfig.resourceNameSize);								
				//create a new resource
				 roomManagerAPI
					.post(token, resourceEndPoint, resourceJSon, function(err,resp){
						idResourceCreate = resp.body._id;
						//json for associate resource to room
						associateResource = {							
							"resourceId" : idResourceCreate,
							"quantity" : 1							
						};
						//endpoint for associate an resource to room
						var associateEndPoint = url + '/rooms/' + idRoom + '/resources';
						//associate resource to room
						roomManagerAPI
							.post(token,associateEndPoint ,associateResource, function(err, res){
								//json of the room selected
								roomName = res.body.customDisplayName;
								roomJSON = {"customDisplayName" : roomName};									
								size = res.body.resources.length;									
								idLastResource = res.body.resources[size-1]._id;
								//endPoint for execute actions over a room									
								endPointFinal = servicesEndPoint + '/' + idService + rooms + '/' + idRoom + resources + '/' + idLastResource;
								enPointRes = servicesEndPoint + '/' + idService + rooms + '/' + idRoom + resources;

								done();
							});						
					});
			});
	});

	afterEach(function (done) {
		//delete resource create
		roomManagerAPI
			.del(token, + '/' + idResourceCreate,function(err,res){
				done();
			});	
	});

	it('CRUD-GET /services/{:serviceId}/rooms/{:roomId}/resources/{:roomResourceId} api returns the resources specified of a room', function (done) {
		//get the resource of a room specified
		mongodb
			.findDocument('rooms',roomJSON,function(res){				
				roomManagerAPI
					.get(endPointFinal, function(err, re){
										
						expect(re.status).to.equal(statusExpected);
						resourcesResId = (res.resources[size-1]._id).toString();
						expect(resourcesResId).to.equal(re.body._id);						
						expect(re.body).to.have.property("_id");
						expect(re.body).to.have.property("@link");					

						done();
					});	
			});		
	});

	it('CRUD-PUT /services/{:serviceId}/rooms/{:roomId}/resources/{:roomResourceId} api update the resources specified of a room', function (done) {
		//variable for the modify an resource
		var quantityJON = roomResource.amount;
		//put the last resource
		roomManagerAPI
			.put(token,endPointFinal, quantityJON, function(err, resp){
				mongodb
					.findDocument('rooms', roomJSON, function(res){	
						expect(resp.status).to.equal(statusExpected);
						resourcesMongoId = (res.resources[size-1]._id).toString();
						resourcesAPIpId = (resp.body.resources[size-1]._id).toString();
						expect(resourcesMongoId).to.equal(resourcesAPIpId);
                        expect(res.resources[size-1].quantity).to.equal(resp.body.resources[size-1].quantity);
						expect(res.emailAddress).to.equal(resp.body.emailAddress);
						expect(res.displayName).to.equal(resp.body.displayName);
						expect(res.customDisplayName).to.equal(resp.body.customDisplayName);
						expect(res.enabled).to.equal(resp.body.enabled);
						expect(res.locationId).to.equal(resp.body.locationId);

						expect(resp.body.resources[size-1]).to.have.property("_id");										
						expect(resp.body.resources[size-1]).to.have.property("quantity");

						arrayProperties.forEach( function (prop) {
							expect(res).to.have.property(prop);
						});

						done();
					});				
			});
	});
  
    

	it('CRUD-DEL /services/{:serviceId}/rooms/{:roomId}/resources/{:roomResourceId} api deleted the resources specified of a room', function (done) {
		//delete the last resource
		roomManagerAPI
			.del(token, endPointFinal, function(err, re){
				mongodb
					.findDocument('rooms', roomJSON, function(res){								
						expect(re.status).to.equal(statusExpected);												
						expect(re.body.resources[size-1]).to.not.exist;
						expect(res.emailAddress).to.equal(re.body.emailAddress);
						expect(res.displayName).to.equal(re.body.displayName);
						expect(res.customDisplayName).to.equal(re.body.customDisplayName);
						expect(res.enabled).to.equal(re.body.enabled);
						expect(res.locationId).to.equal(re.body.locationId);
						arrayProperties.forEach( function (prop) {
							expect(res).to.have.property(prop);
						});
						done();
					});	
			});
	});
     //this test case has a bug
	it.skip('Get /services/{:serviceId}/rooms/{:roomId}/resources',function(done){
       roomManagerAPI
         .get(enPointRes, function(err,res){ 
           expect(res.status).to.equal(statusExpected);
           expect(res.body[0]).to.have.property('_id');     
           expect(idLastResource).to.equal(idResourceCreate);
           done();
         });
    });
    //this test case has a bug
    it.skip('Post /services/{:serviceId}/rooms/{:roomId}/resources', function(done){
     
       var jsonResource = roomResource.newResource;
       jsonResource.resourceId = idResourceCreate;

       roomManagerAPI
          .post(token,enPointRes,jsonResource, function(err,res) {
          	    size = res.body.resources.length;
                idLastResource = res.body.resources[size-1]._id;                
                arrayProperties.forEach( function (prop) {
					expect(res.body).to.have.property(prop);
			    });
                expect(res.status).to.equal(statusExpected);
                expect(idLastResource).to.equal(idResourceCreate);
                done();
          });
      
    });


});