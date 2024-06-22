const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  contact: {
    type: Number,
    required: true,
    maxlength: 10,
  },
  bio: {
    type: String,
    default: "",
  },
  profileImg: {
    type: String,
    default: "",
  },
  coverImg: {
    type: String,
    default: "",
  },
  likedPosts:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default:[]
  }]
  
},{
  timestamps: true,
});

module.exports = mongoose.model("User", UserSchema);
