const User = require("../models/auth.model");
const notificationModel = require("../models/notification.model");
const Post = require("../models/post.model");
const { v2: cloudinary } = require("cloudinary");
const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User Not Found" });
    if (!text && !img) {
      return res.status(400).json({ message: "Please Enter Text or Image" });
    }
    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }
    const newPost = new Post({
      user: user._id,
      text,
      img,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in createPost Controller :", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post Not Found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized User" });
    }
    if (post.img) {
      const publicId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id.toString();
    if (!text)
      return res.status(400).json({ message: "Text Field is required" });
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post Not Found" });
    const newComment = { user: userId, text };
    post.comments.push(newComment);
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.log("Error in CommentOnPost", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const LikeController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post Not Found" });
    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      res.status(200).json({ message: "Post Unliked Successfully" });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
    } else {
      await Post.updateOne({ _id: postId }, { $push: { likes: userId } });
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

      const notification = new notificationModel({
        type: "like",
        from: userId,
        to: post.user,
      });
      await notification.save();

      res.status(200).json({ message: "Post Liked Successfully" });
    }
  } catch (error) {
    console.log("Error in LikeController", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "username profileImg fullname",
      });
    if (posts.length === 0) {
      return res.status(200).json({ message: "No Posts Found", posts: [] });
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getAllPosts:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const GetAllLikedPostsByUser = async (req, res) => {
  const { id: userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User Not Found" });
    const likedPosts = await Post.find({
      _id: { $in: user.likedPosts },
    })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "username profileImg fullname",
      });
    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error In GetAllLikedPostByUser :", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getFollowingPost = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User Not Found" });
    const following = user.following;
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "username profileImg fullname",
      });
    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in getFollowingPost controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getUserPost = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({username});
    if (!user) return res.status(404).json({ error: "User Not Found" });
    const userPosts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "username profileImg fullname",

      });
      res.status(200).json(userPosts)
  } catch (error) {
    console.log("Error in getUserPost controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = {
  createPost,
  deletePost,
  commentOnPost,
  LikeController,
  getAllPosts,
  GetAllLikedPostsByUser,
  getFollowingPost,
  getUserPost,
};
