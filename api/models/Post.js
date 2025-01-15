const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const PostSchema = new Schema({
  title: String,
  summary: String,
  content: String,
  cover: String,
  author: {type: Schema.Types.ObjectId, ref:'User'},
}, {
  // Model parameters (object with extra options)
  timestamps: true, // To indicate time of posting
});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;