/**
 * @fileoverview gRPC-Web generated client stub for energymanagementevents.v1
 * @enhanceable
 * @public
 */

// Code generated by protoc-gen-grpc-web. DO NOT EDIT.
// versions:
// 	protoc-gen-grpc-web v1.5.0
// 	protoc              v5.29.3
// source: energymanagementevents/v1/events.proto


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');

const proto = {};
proto.energymanagementevents = {};
proto.energymanagementevents.v1 = require('./events_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?grpc.web.ClientOptions} options
 * @constructor
 * @struct
 * @final
 */
proto.energymanagementevents.v1.EnergyManagementEventsServiceClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options.format = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname.replace(/\/+$/, '');

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?grpc.web.ClientOptions} options
 * @constructor
 * @struct
 * @final
 */
proto.energymanagementevents.v1.EnergyManagementEventsServicePromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options.format = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname.replace(/\/+$/, '');

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.energymanagementevents.v1.StreamEnergyManagementEventsRequest,
 *   !proto.energymanagementevents.v1.StreamEnergyManagementEventsResponse>}
 */
const methodDescriptor_EnergyManagementEventsService_StreamEnergyManagementEvents = new grpc.web.MethodDescriptor(
  '/energymanagementevents.v1.EnergyManagementEventsService/StreamEnergyManagementEvents',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.energymanagementevents.v1.StreamEnergyManagementEventsRequest,
  proto.energymanagementevents.v1.StreamEnergyManagementEventsResponse,
  /**
   * @param {!proto.energymanagementevents.v1.StreamEnergyManagementEventsRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.energymanagementevents.v1.StreamEnergyManagementEventsResponse.deserializeBinary
);


/**
 * @param {!proto.energymanagementevents.v1.StreamEnergyManagementEventsRequest} request The request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.energymanagementevents.v1.StreamEnergyManagementEventsResponse>}
 *     The XHR Node Readable Stream
 */
proto.energymanagementevents.v1.EnergyManagementEventsServiceClient.prototype.streamEnergyManagementEvents =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/energymanagementevents.v1.EnergyManagementEventsService/StreamEnergyManagementEvents',
      request,
      metadata || {},
      methodDescriptor_EnergyManagementEventsService_StreamEnergyManagementEvents);
};


/**
 * @param {!proto.energymanagementevents.v1.StreamEnergyManagementEventsRequest} request The request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.energymanagementevents.v1.StreamEnergyManagementEventsResponse>}
 *     The XHR Node Readable Stream
 */
proto.energymanagementevents.v1.EnergyManagementEventsServicePromiseClient.prototype.streamEnergyManagementEvents =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/energymanagementevents.v1.EnergyManagementEventsService/StreamEnergyManagementEvents',
      request,
      metadata || {},
      methodDescriptor_EnergyManagementEventsService_StreamEnergyManagementEvents);
};


module.exports = proto.energymanagementevents.v1;

