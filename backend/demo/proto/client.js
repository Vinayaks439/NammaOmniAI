// demo/client.js

// expose your protos on `window.proto`
window.proto = require('./proto/energymanagementevents/v1/events_pb.js');

// expose the gRPC-Web client
window.grpc = require('grpc-web-client').grpc;

// grab the service client constructor and request class
const svc = require('./proto/energymanagementevents/v1/events_grpc_web_pb.js');
window.EnergyManagementEventsServiceClient = svc.energymanagementevents.v1.EnergyManagementEventsServiceClient;
window.StreamEnergyManagementEventsRequest = proto.energymanagementevents.v1.StreamEnergyManagementEventsRequest;
