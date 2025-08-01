/**
 * @fileoverview gRPC-Web generated client stub for summary.v1
 * @enhanceable
 * @public
 */

// Code generated by protoc-gen-grpc-web. DO NOT EDIT.
// versions:
// 	protoc-gen-grpc-web v1.5.0
// 	protoc              v5.29.3
// source: backend/summary/v1/summary.proto


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');

const proto = {};
proto.summary = {};
proto.summary.v1 = require('./summary_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?grpc.web.ClientOptions} options
 * @constructor
 * @struct
 * @final
 */
proto.summary.v1.SummaryServiceClient =
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
proto.summary.v1.SummaryServicePromiseClient =
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
 *   !proto.summary.v1.StreamSummaryRequest,
 *   !proto.summary.v1.StreamSummaryResponse>}
 */
const methodDescriptor_SummaryService_StreamSummary = new grpc.web.MethodDescriptor(
  '/summary.v1.SummaryService/StreamSummary',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.summary.v1.StreamSummaryRequest,
  proto.summary.v1.StreamSummaryResponse,
  /**
   * @param {!proto.summary.v1.StreamSummaryRequest} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.summary.v1.StreamSummaryResponse.deserializeBinary
);


/**
 * @param {!proto.summary.v1.StreamSummaryRequest} request The request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.summary.v1.StreamSummaryResponse>}
 *     The XHR Node Readable Stream
 */
proto.summary.v1.SummaryServiceClient.prototype.streamSummary =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/summary.v1.SummaryService/StreamSummary',
      request,
      metadata || {},
      methodDescriptor_SummaryService_StreamSummary);
};


/**
 * @param {!proto.summary.v1.StreamSummaryRequest} request The request proto
 * @param {?Object<string, string>=} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.summary.v1.StreamSummaryResponse>}
 *     The XHR Node Readable Stream
 */
proto.summary.v1.SummaryServicePromiseClient.prototype.streamSummary =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/summary.v1.SummaryService/StreamSummary',
      request,
      metadata || {},
      methodDescriptor_SummaryService_StreamSummary);
};


module.exports = proto.summary.v1;

