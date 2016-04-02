var init          = require('../init.js');
var expect        = require('chai').expect;
var RequireServices = require(GLOBAL.initialDirectory+'/lib/req-serv.js').RequireServices;
var requireServices = new RequireServices();

var mongodb = requireServices.mongodb();
var ObjectId = require('mongodb').ObjectID;
var properties = '';


var selectProperties = function(service){
	
	switch(service) {
		case 'servicesType':{
			var properties = requireServices.serviceConfig().typeServProperties;
			return properties;
		}
			/////serviceprperties
			break;
		case 'resourcemodels':{
			var properties = requireServices.resourceConfig().resourceProperties;
			return properties;
		}
	}
	
};
var verifyProperties = function(serviceType,item){
	var count = 0;
	var properties = selectProperties(serviceType);
	properties.forEach(function(el){
		if(searchProperty(el, item))
			count++;
	});
	return (count === properties.length)? true: false;
};
var searchProperty = function(property, itemJson){
	for(var prop in itemJson){
		if(property == prop)
			return true;
	}
	return false;
};
var searchValue = function(prop, value, item){
	for(var key in item){
		if(key ===prop && value === item[key])
			return true;
	}
	return false;
};
var verifyValues = function(nameItem, idItem, item, callback){
	properties = selectProperties(nameItem);
	var count = 0;
	mongodb.findDocument(nameItem,{"_id": ObjectId(idItem)},function(items){
		for(var key in items){
			if(searchValue(key, items[key],item))
				count = count + 1;
		}
		(count >= (properties.length-1))? callback(true): callback(false);
	});
};
 var getDataBase = function(nameItem, callback){
	 mongodb.findDocuments(nameItem, function(items){
		 callback(items);
	});
 };

exports.getDataBase = getDataBase;
exports.verifyValues = verifyValues;
exports.verifyProperties = verifyProperties;