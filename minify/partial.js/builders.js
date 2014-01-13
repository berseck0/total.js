// Copyright 2012-2014 (c) Peter Širka <petersirka@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

"use strict";var schema={};var schemaValidation={};var schemaDefaults={};var UNDEFINED="undefined";var FUNCTION="function";var OBJECT="object";var STRING="string";var NUMBER="number";var BOOLEAN="boolean";var REQUIRED='The field "@" is required.';function ErrorBuilder(onResource){this.builder=[];this.onResource=onResource||null;this.length=0;this.replacer=[];this.isPrepared=false}function UrlBuilder(){this.builder={}}function PageBuilder(items,page,max){this.isNext=false;this.isPrev=false;this.items=items;this.count=0;this.skip=0;this.take=0;this.page=0;this.max=0;this.visible=false;this.refresh(items,page,max)}exports.schema=function(name,obj,defaults){if(typeof obj===UNDEFINED)return schema[name]||null;if(typeof defaults===FUNCTION)schemaDefaults[name]=defaults;schema[name]=obj;return obj};exports.isJoin=function(value){if(!value)return false;if(value[0]==="[")return true;return typeof schema[value]!==UNDEFINED};exports.validation=function(name,arr){if(typeof arr===UNDEFINED)return schemaValidation[name]||[];schemaValidation[name]=arr;return arr};exports.default=function(name){return exports.defaults(name)};exports.defaults=function(name){var obj=exports.schema(name);if(obj===null)return null;var defaults=schemaDefaults[name];var item=utils.extend({},obj,true);var properties=Object.keys(item);var length=properties.length;for(var i=0;i<length;i++){var property=properties[i];var value=item[property];var type=typeof value;if(defaults){var def=defaults(property,true);if(typeof def!==UNDEFINED){item[property]=def;continue}}if(type===FUNCTION){if(value===Number){item[property]=0;continue}if(value===Boolean){item[property]=false;continue}if(value===String){item[property]="";continue}if(value===Date){item[property]=new Date;continue}if(value===Object){item[property]={};continue}if(value===Array){item[property]=[];continue}item[property]=value();continue}if(type===NUMBER){item[property]=0;continue}if(type===BOOLEAN){item[property]=false;continue}if(type===OBJECT){item[property]=value instanceof Array?[]:{};continue}if(type!==STRING){item[property]=null;continue}var isArray=value[0]==="[";if(isArray)value=value.substring(1,value.length-1);if(isArray){item[property]=[];continue}var lower=value.toLowerCase();if(lower.contains([STRING,"text","varchar","nvarchar","binary","data","base64"])){item[property]="";continue}if(lower.contains(["int",NUMBER,"decimal","byte","float","double"])){item[property]=0;continue}if(lower.contains("bool")){item[property]=false;continue}if(lower.contains(["date","time"])){item[property]=new Date;continue}if(lower.contains(["object"])){item[property]={};continue}if(lower.contains(["array"])){item[property]=[];continue}if(lower.contains(["binary","data","base64"])){item[property]=null;continue}item[property]=exports.defaults(value)}return item};exports.prepare=function(name,model){var obj=exports.schema(name);if(obj===null)return null;var tmp;var item=utils.extend({},obj,true);var properties=Object.keys(item);var defaults=schemaDefaults[name];var length=properties.length;for(var i=0;i<length;i++){var property=properties[i];var val=model[property];if(typeof val===UNDEFINED&&defaults)val=defaults(property,false);if(typeof val===UNDEFINED)val="";var value=item[property];var type=typeof value;var typeval=typeof val;if(typeval===FUNCTION)val=val();if(type===FUNCTION){if(value===Number){item[property]=utils.parseFloat(val);continue}if(value===Boolean){tmp=val.toString();item[property]=tmp==="true"||tmp==="1";continue}if(value===String){item[property]=val.toString();continue}if(value===Date){tmp=null;switch(typeval){case OBJECT:if(utils.isDate(val))tmp=val;else tmp=null;break;case NUMBER:tmp=new Date(val);break;case STRING:if(val==="")tmp=null;else tmp=val.parseDate();break}if(tmp!==null&&typeof tmp===OBJECT&&tmp.toString()==="Invalid Date")tmp=null;item[property]=tmp||(defaults?isUndefined(defaults(property),null):null);continue}item[property]=isUndefined(defaults(property),null);continue}if(type===NUMBER){item[property]=utils.parseFloat(val);continue}if(val===null||typeval===UNDEFINED)tmp="";else tmp=val.toString();if(type===BOOLEAN){item[property]=tmp==="true"||tmp==="1";continue}if(type!==STRING){item[property]=tmp;continue}var isArray=value[0]==="["||value==="array";if(isArray){if(value[0]==="[")value=value.substring(1,value.length-1);else value=null;if(!(val instanceof Array)){item[property]=defaults?isUndefined(defaults(property,false),[]):[];continue}item[property]=[];var sublength=val.length;for(var j=0;j<sublength;j++){if(value===null){item[property].push(model[property][j]);continue}var tmp=model[property][j];switch(value){case"string":case"varchar":case"text":item[property].push((tmp||"").toString());break;case"bool":case"boolean":tmp=(tmp||"").toString().toLowerCase();item[property].push(tmp==="true"||tmp==="1");break;case"int":case"integer":item[property].push(utils.parseInt(tmp));break;case"number":item[property].push(utils.parseFloat(tmp));break;default:item[property][j]=exports.prepare(value,model[property][j]);break}}continue}var lower=value.toLowerCase();if(lower.contains([STRING,"text","varchar","nvarchar"])){var beg=lower.indexOf("(");if(beg===-1){item[property]=tmp;continue}var size=lower.substring(beg+1,lower.length-1).parseInt();item[property]=tmp.max(size,"...");continue}if(lower.contains(["int","byte"])){item[property]=utils.parseInt(val);continue}if(lower.contains(["decimal",NUMBER,"float","double"])){item[property]=utils.parseFloat(val);continue}if(lower.contains("bool",BOOLEAN)){item[property]=tmp==="true"||tmp==="1";continue}if(lower.contains(["date","time"])){if(typeval==="date"){item[property]=val;continue}if(typeval===STRING){item[property]=val.parseDate();continue}if(typeval===NUMBER){item[property]=new Date(val);continue}item[property]=isUndefined(defaults(property));continue}item[property]=exports.prepare(value,model[property])}return item};function isUndefined(value,def){if(typeof value===UNDEFINED)return def;return value}ErrorBuilder.prototype.add=function(name,error,path){var self=this;self.isPrepared=false;if(name instanceof ErrorBuilder){name.builder.forEach(function(o){self.builder.push(o)});self.length=self.builder.length;return self}self.builder.push({name:name,error:error||"@",path:path});self.length=self.builder.length;return self};ErrorBuilder.prototype.remove=function(name){var self=this;self.builder=self.builder.remove(function(o){return o.name===name});self.length=self.builder.length;return self};ErrorBuilder.prototype.hasError=function(name){var self=this;if(name){return self.builder.find(function(o){return o.name===name})!==null}return self.builder.length>0};ErrorBuilder.prototype.read=function(name){var self=this;if(!self.isPrepared)self.prepare();var error=self.builder.find(function(o){return o.name===name});if(error!==null)return error.error;return null};ErrorBuilder.prototype.clear=function(){var self=this;self.builder=[];self.length=0;return self};ErrorBuilder.prototype.replace=function(search,newvalue){var self=this;self.isPrepared=false;self.replacer[search]=newvalue;return self};ErrorBuilder.prototype.json=function(){return JSON.stringify(this.prepare().builder)};ErrorBuilder.prototype.JSON=function(){return JSON.stringify(this.prepare().builder)};ErrorBuilder.prototype._prepare=function(){var self=this;if(self.onResource===null)return self;var builder=self.builder;var length=builder.length;for(var i=0;i<length;i++){var o=builder[i];if(o.error[0]!=="@")continue;if(o.error.length===1)o.error=self.onResource(o.name);else o.error=self.onResource(o.error.substring(1));if(typeof o.error===UNDEFINED)o.error=REQUIRED.replace("@",o.name)}return self};ErrorBuilder.prototype._prepareReplace=function(){var self=this;var builder=self.builder;var lengthBuilder=builder.length;var keys=Object.keys(self.replacer);var lengthKeys=keys.length;if(lengthBuilder===0||lengthKeys===0)return self;for(var i=0;i<lengthBuilder;i++){var o=builder[i];for(var j=0;j<lengthKeys;j++){var key=keys[j];o.error=o.error.replace(key,self.replacer[key])}}return self};ErrorBuilder.prototype.prepare=function(){var self=this;if(self.isPrepared)return self;self._prepare()._prepareReplace();self.isPrepared=true;return self};PageBuilder.prototype.refresh=function(items,page,max){var self=this;self.count=Math.floor(items/max)+(items%max>0?1:0);self.page=page-1;if(self.page<0)self.page=0;self.items=items;self.skip=self.page*max;self.take=max;self.max=max;self.isPrev=self.page>0;self.isNext=self.page<self.count-1;self.visible=self.count>1;self.page++;return self};PageBuilder.prototype.render=function(fn,max){var self=this;var builder=[];if(typeof max===UNDEFINED){for(var i=1;i<self.count+1;i++)builder.push(fn(i,i===self.page));return builder}var half=Math.floor(max/2);var pages=self.count;var pageFrom=self.page-half;var pageTo=self.page+half;var plus=0;if(pageFrom<=0){plus=Math.abs(pageFrom);pageFrom=1;pageTo+=plus}if(pageTo>=pages){pageTo=pages;pageFrom=pages-max}for(var i=pageFrom;i<pageTo+1;i++)builder.push(fn(i,i===self.page));return builder};UrlBuilder.prototype.add=function(name,value){var self=this;if(typeof name==="object"){Object.keys(name).forEach(function(o){self.builder[o]=name[o]});return}self.builder[name]=value;return self};UrlBuilder.prototype.remove=function(name){var self=this;delete self.builder[name];return self};UrlBuilder.prototype.read=function(name){return this.builder[name]||null};UrlBuilder.prototype.clear=function(){var self=this;self.builder={};return self};UrlBuilder.prototype.toString=function(){var self=this;var builder=[];Object.keys(self.builder).forEach(function(o){builder.push(o+"="+encodeURIComponent(self.builder[o]||""))});return builder.join("&")};UrlBuilder.prototype.hasValue=function(keys){if(typeof keys===UNDEFINED)return false;var self=this;if(typeof keys==="string")keys=[keys];for(var i=0;i<keys.length;i++){var val=self.builder[keys[i]];if(typeof val===UNDEFINED||val===null)return false}return true};UrlBuilder.prototype.toOne=function(keys,delimiter){var self=this;var builder=[];keys.forEach(function(o){builder.push(self.builder[o]||"")});return builder.join(delimiter||"&")};exports.ErrorBuilder=ErrorBuilder;exports.PageBuilder=PageBuilder;exports.UrlBuilder=UrlBuilder;