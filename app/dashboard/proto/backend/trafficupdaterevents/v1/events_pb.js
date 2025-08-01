// source: backend/trafficupdaterevents/v1/events.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {missingRequire} reports error on implicit type usages.
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!
/* eslint-disable */
// @ts-nocheck

var jspb = require('google-protobuf');
var goog = jspb;
var global =
    (typeof globalThis !== 'undefined' && globalThis) ||
    (typeof window !== 'undefined' && window) ||
    (typeof global !== 'undefined' && global) ||
    (typeof self !== 'undefined' && self) ||
    (function () { return this; }).call(null) ||
    Function('return this')();

goog.exportSymbol('proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest', null, global);
goog.exportSymbol('proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse', null, global);
goog.exportSymbol('proto.trafficupdaterevents.v1.TrafficDigestEntry', null, global);
goog.exportSymbol('proto.trafficupdaterevents.v1.WeatherSummary', null, global);
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest.displayName = 'proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.repeatedFields_, null);
};
goog.inherits(proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.displayName = 'proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.trafficupdaterevents.v1.TrafficDigestEntry, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.trafficupdaterevents.v1.TrafficDigestEntry.displayName = 'proto.trafficupdaterevents.v1.TrafficDigestEntry';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.trafficupdaterevents.v1.WeatherSummary = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.trafficupdaterevents.v1.WeatherSummary, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.trafficupdaterevents.v1.WeatherSummary.displayName = 'proto.trafficupdaterevents.v1.WeatherSummary';
}



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest.prototype.toObject = function(opt_includeInstance) {
  return proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest.toObject = function(includeInstance, msg) {
  var f, obj = {
filter: jspb.Message.getFieldWithDefault(msg, 1, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest}
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest;
  return proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest}
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setFilter(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getFilter();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
};


/**
 * optional string filter = 1;
 * @return {string}
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest.prototype.getFilter = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest} returns this
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsRequest.prototype.setFilter = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};



/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.repeatedFields_ = [3,4];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.prototype.toObject = function(opt_includeInstance) {
  return proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.toObject = function(includeInstance, msg) {
  var f, obj = {
id: jspb.Message.getFieldWithDefault(msg, 1, ""),
timestamp: jspb.Message.getFieldWithDefault(msg, 2, 0),
trafficDigestList: jspb.Message.toObjectList(msg.getTrafficDigestList(),
    proto.trafficupdaterevents.v1.TrafficDigestEntry.toObject, includeInstance),
weatherList: jspb.Message.toObjectList(msg.getWeatherList(),
    proto.trafficupdaterevents.v1.WeatherSummary.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse}
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse;
  return proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse}
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setId(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt64());
      msg.setTimestamp(value);
      break;
    case 3:
      var value = new proto.trafficupdaterevents.v1.TrafficDigestEntry;
      reader.readMessage(value,proto.trafficupdaterevents.v1.TrafficDigestEntry.deserializeBinaryFromReader);
      msg.addTrafficDigest(value);
      break;
    case 4:
      var value = new proto.trafficupdaterevents.v1.WeatherSummary;
      reader.readMessage(value,proto.trafficupdaterevents.v1.WeatherSummary.deserializeBinaryFromReader);
      msg.addWeather(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getId();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getTimestamp();
  if (f !== 0) {
    writer.writeInt64(
      2,
      f
    );
  }
  f = message.getTrafficDigestList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      3,
      f,
      proto.trafficupdaterevents.v1.TrafficDigestEntry.serializeBinaryToWriter
    );
  }
  f = message.getWeatherList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      4,
      f,
      proto.trafficupdaterevents.v1.WeatherSummary.serializeBinaryToWriter
    );
  }
};


/**
 * optional string id = 1;
 * @return {string}
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.prototype.getId = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse} returns this
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.prototype.setId = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional int64 timestamp = 2;
 * @return {number}
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.prototype.getTimestamp = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse} returns this
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.prototype.setTimestamp = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * repeated TrafficDigestEntry traffic_digest = 3;
 * @return {!Array<!proto.trafficupdaterevents.v1.TrafficDigestEntry>}
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.prototype.getTrafficDigestList = function() {
  return /** @type{!Array<!proto.trafficupdaterevents.v1.TrafficDigestEntry>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.trafficupdaterevents.v1.TrafficDigestEntry, 3));
};


/**
 * @param {!Array<!proto.trafficupdaterevents.v1.TrafficDigestEntry>} value
 * @return {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse} returns this
*/
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.prototype.setTrafficDigestList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 3, value);
};


/**
 * @param {!proto.trafficupdaterevents.v1.TrafficDigestEntry=} opt_value
 * @param {number=} opt_index
 * @return {!proto.trafficupdaterevents.v1.TrafficDigestEntry}
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.prototype.addTrafficDigest = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 3, opt_value, proto.trafficupdaterevents.v1.TrafficDigestEntry, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse} returns this
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.prototype.clearTrafficDigestList = function() {
  return this.setTrafficDigestList([]);
};


/**
 * repeated WeatherSummary weather = 4;
 * @return {!Array<!proto.trafficupdaterevents.v1.WeatherSummary>}
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.prototype.getWeatherList = function() {
  return /** @type{!Array<!proto.trafficupdaterevents.v1.WeatherSummary>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.trafficupdaterevents.v1.WeatherSummary, 4));
};


/**
 * @param {!Array<!proto.trafficupdaterevents.v1.WeatherSummary>} value
 * @return {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse} returns this
*/
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.prototype.setWeatherList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 4, value);
};


/**
 * @param {!proto.trafficupdaterevents.v1.WeatherSummary=} opt_value
 * @param {number=} opt_index
 * @return {!proto.trafficupdaterevents.v1.WeatherSummary}
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.prototype.addWeather = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 4, opt_value, proto.trafficupdaterevents.v1.WeatherSummary, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse} returns this
 */
proto.trafficupdaterevents.v1.StreamTrafficUpdateEventsResponse.prototype.clearWeatherList = function() {
  return this.setWeatherList([]);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.prototype.toObject = function(opt_includeInstance) {
  return proto.trafficupdaterevents.v1.TrafficDigestEntry.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.trafficupdaterevents.v1.TrafficDigestEntry} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.toObject = function(includeInstance, msg) {
  var f, obj = {
timestamp: jspb.Message.getFieldWithDefault(msg, 1, ""),
location: jspb.Message.getFieldWithDefault(msg, 2, ""),
summary: jspb.Message.getFieldWithDefault(msg, 3, ""),
severityReason: jspb.Message.getFieldWithDefault(msg, 4, ""),
delay: jspb.Message.getFieldWithDefault(msg, 5, ""),
advice: jspb.Message.getFieldWithDefault(msg, 6, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.trafficupdaterevents.v1.TrafficDigestEntry}
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.trafficupdaterevents.v1.TrafficDigestEntry;
  return proto.trafficupdaterevents.v1.TrafficDigestEntry.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.trafficupdaterevents.v1.TrafficDigestEntry} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.trafficupdaterevents.v1.TrafficDigestEntry}
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setTimestamp(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setLocation(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setSummary(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setSeverityReason(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setDelay(value);
      break;
    case 6:
      var value = /** @type {string} */ (reader.readString());
      msg.setAdvice(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.trafficupdaterevents.v1.TrafficDigestEntry.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.trafficupdaterevents.v1.TrafficDigestEntry} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getTimestamp();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getLocation();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getSummary();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getSeverityReason();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getDelay();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getAdvice();
  if (f.length > 0) {
    writer.writeString(
      6,
      f
    );
  }
};


/**
 * optional string timestamp = 1;
 * @return {string}
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.prototype.getTimestamp = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.trafficupdaterevents.v1.TrafficDigestEntry} returns this
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.prototype.setTimestamp = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string location = 2;
 * @return {string}
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.prototype.getLocation = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.trafficupdaterevents.v1.TrafficDigestEntry} returns this
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.prototype.setLocation = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string summary = 3;
 * @return {string}
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.prototype.getSummary = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.trafficupdaterevents.v1.TrafficDigestEntry} returns this
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.prototype.setSummary = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string severity_reason = 4;
 * @return {string}
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.prototype.getSeverityReason = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.trafficupdaterevents.v1.TrafficDigestEntry} returns this
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.prototype.setSeverityReason = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string delay = 5;
 * @return {string}
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.prototype.getDelay = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.trafficupdaterevents.v1.TrafficDigestEntry} returns this
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.prototype.setDelay = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional string advice = 6;
 * @return {string}
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.prototype.getAdvice = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 6, ""));
};


/**
 * @param {string} value
 * @return {!proto.trafficupdaterevents.v1.TrafficDigestEntry} returns this
 */
proto.trafficupdaterevents.v1.TrafficDigestEntry.prototype.setAdvice = function(value) {
  return jspb.Message.setProto3StringField(this, 6, value);
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.trafficupdaterevents.v1.WeatherSummary.prototype.toObject = function(opt_includeInstance) {
  return proto.trafficupdaterevents.v1.WeatherSummary.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.trafficupdaterevents.v1.WeatherSummary} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.trafficupdaterevents.v1.WeatherSummary.toObject = function(includeInstance, msg) {
  var f, obj = {
location: jspb.Message.getFieldWithDefault(msg, 1, ""),
temperature: jspb.Message.getFieldWithDefault(msg, 2, ""),
conditions: jspb.Message.getFieldWithDefault(msg, 3, ""),
precipitation: jspb.Message.getFieldWithDefault(msg, 4, ""),
wind: jspb.Message.getFieldWithDefault(msg, 5, "")
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.trafficupdaterevents.v1.WeatherSummary}
 */
proto.trafficupdaterevents.v1.WeatherSummary.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.trafficupdaterevents.v1.WeatherSummary;
  return proto.trafficupdaterevents.v1.WeatherSummary.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.trafficupdaterevents.v1.WeatherSummary} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.trafficupdaterevents.v1.WeatherSummary}
 */
proto.trafficupdaterevents.v1.WeatherSummary.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setLocation(value);
      break;
    case 2:
      var value = /** @type {string} */ (reader.readString());
      msg.setTemperature(value);
      break;
    case 3:
      var value = /** @type {string} */ (reader.readString());
      msg.setConditions(value);
      break;
    case 4:
      var value = /** @type {string} */ (reader.readString());
      msg.setPrecipitation(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setWind(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.trafficupdaterevents.v1.WeatherSummary.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.trafficupdaterevents.v1.WeatherSummary.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.trafficupdaterevents.v1.WeatherSummary} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.trafficupdaterevents.v1.WeatherSummary.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getLocation();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getTemperature();
  if (f.length > 0) {
    writer.writeString(
      2,
      f
    );
  }
  f = message.getConditions();
  if (f.length > 0) {
    writer.writeString(
      3,
      f
    );
  }
  f = message.getPrecipitation();
  if (f.length > 0) {
    writer.writeString(
      4,
      f
    );
  }
  f = message.getWind();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
};


/**
 * optional string location = 1;
 * @return {string}
 */
proto.trafficupdaterevents.v1.WeatherSummary.prototype.getLocation = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.trafficupdaterevents.v1.WeatherSummary} returns this
 */
proto.trafficupdaterevents.v1.WeatherSummary.prototype.setLocation = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional string temperature = 2;
 * @return {string}
 */
proto.trafficupdaterevents.v1.WeatherSummary.prototype.getTemperature = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 2, ""));
};


/**
 * @param {string} value
 * @return {!proto.trafficupdaterevents.v1.WeatherSummary} returns this
 */
proto.trafficupdaterevents.v1.WeatherSummary.prototype.setTemperature = function(value) {
  return jspb.Message.setProto3StringField(this, 2, value);
};


/**
 * optional string conditions = 3;
 * @return {string}
 */
proto.trafficupdaterevents.v1.WeatherSummary.prototype.getConditions = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 3, ""));
};


/**
 * @param {string} value
 * @return {!proto.trafficupdaterevents.v1.WeatherSummary} returns this
 */
proto.trafficupdaterevents.v1.WeatherSummary.prototype.setConditions = function(value) {
  return jspb.Message.setProto3StringField(this, 3, value);
};


/**
 * optional string precipitation = 4;
 * @return {string}
 */
proto.trafficupdaterevents.v1.WeatherSummary.prototype.getPrecipitation = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 4, ""));
};


/**
 * @param {string} value
 * @return {!proto.trafficupdaterevents.v1.WeatherSummary} returns this
 */
proto.trafficupdaterevents.v1.WeatherSummary.prototype.setPrecipitation = function(value) {
  return jspb.Message.setProto3StringField(this, 4, value);
};


/**
 * optional string wind = 5;
 * @return {string}
 */
proto.trafficupdaterevents.v1.WeatherSummary.prototype.getWind = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.trafficupdaterevents.v1.WeatherSummary} returns this
 */
proto.trafficupdaterevents.v1.WeatherSummary.prototype.setWind = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


goog.object.extend(exports, proto.trafficupdaterevents.v1);
