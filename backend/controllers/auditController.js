import AuditLog from "../models/auditLogModel.js";
import User from "../models/userModel.js";



export const createLog =
async (
req,
res
)=>{

try{

const log =
await AuditLog
.create({

action:
req.body.action,

performedBy:
req.user.id,

details:
req.body.details,

});

res
.status(201)
.json({

message:
"Log created",

log,

});

}

catch(error){

res
.status(500)
.json({

message:
error.message

});

}

};





export const getLogs =
async (
req,
res
)=>{

try{

const logs =
await AuditLog
.findAll({
include: [
  { model: User, as: "performedBy", attributes: ["id", "name", "email", "role"] }
],
order:[
[
"createdAt",
"DESC"
],
[
"id",
"DESC"
]
]

});

res
.status(200)
.json(
logs
);

}

catch(error){

res
.status(500)
.json({

message:
error.message

});

}

};