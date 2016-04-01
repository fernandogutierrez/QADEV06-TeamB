
    var RequireServices = function () {
    	 this.configg = require(GLOBAL.initialDirectory+'/config/config.json');
         this.pathServices = require(GLOBAL.initialDirectory+'/config/path-services.json');
    };
    
    RequireServices.prototype.endPoint = function() {
    	return require(GLOBAL.initialDirectory + this.configg.path.endPoints);
    };
    RequireServices.prototype.roomManagerAPI = function(first_argument) {
       return require(GLOBAL.initialDirectory + this.pathServices.roomManagerAPI);   		
    };
    RequireServices.prototype.config = function() {
       return this.configg;
    };
    
    RequireServices.prototype.publicKey = function() {
    	return require(GLOBAL.initialDirectory + this.configg.path.publicKey);    	
    };

    RequireServices.prototype.publicKeyEndPoint = function() {
    	
       return this.url() + this.endPoint().publicKey;
    };
    RequireServices.prototype.servicesEndPoint = function() {
    	return this.url() + this.endPoint().services;
    };
    RequireServices.prototype.resourceEndPoint = function() {
    	return this.url() + this.endPoint().resources;
    };

    RequireServices.prototype.roomsEndPoint = function() {
    	return  this.url() + this.endPoint().rooms;
    };

    RequireServices.prototype.serviceTypes = function() {
    	return  this.url() + this.endPoint().serviceTypes;
    };
	
	 RequireServices.prototype.service_Types = function() {
    	return  this.url() + this.endPoint().service_Types;
    };
   
    RequireServices.prototype.tokenAPI = function() {
    	return require(GLOBAL.initialDirectory + this.pathServices.tokenAPI);
    };
    RequireServices.prototype.util = function() {
    	return require(GLOBAL.initialDirectory + this.pathServices.util); //common function
    };
	    RequireServices.prototype.compareResults = function() {
    	return require(GLOBAL.initialDirectory + this.pathServices.compareResults); //common function
    };
    RequireServices.prototype.mongodb = function() {
    	return require(GLOBAL.initialDirectory + this.pathServices.mongodb);
    };
    RequireServices.prototype.resourceConfig = function() {
    	return require(GLOBAL.initialDirectory + this.configg.path.resourceConfig);
    };
	RequireServices.prototype.serviceConfig = function() {
    	return require(GLOBAL.initialDirectory + this.configg.path.serviceConfig);
    };
    RequireServices.prototype.roomResource = function() {
    	return require(GLOBAL.initialDirectory + this.configg.path.roomResource);
    };
    RequireServices.prototype.publicKey = function() {
    	return require(GLOBAL.initialDirectory + this.configg.path.publicKey);
    };
    RequireServices.prototype.url = function() {
    	return this.configg.url;
    };
    RequireServices.prototype.locationConfig = function() {
        return require(GLOBAL.initialDirectory + this.configg.path.locationConfig);
    };
    RequireServices.prototype.outOfOrder = function() {
        return require(GLOBAL.initialDirectory + this.configg.path.outOfOrder);
    };
    RequireServices.prototype.room = function() {
        return require(GLOBAL.initialDirectory + this.configg.path.room);
    };
    RequireServices.prototype.meetingConfig = function() {
        return require(GLOBAL.initialDirectory + this.configg.path.meetingConfig);
    };
    exports.RequireServices = RequireServices;
