const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
  name:String,
  owner:String, //email
  createdAt:{
    type:Date,
    default:Date.now
  }
})

module.exports = mongoose.model("Project",projectSchema)