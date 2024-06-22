const express = require("express")
const { protectedRoute } = require("../middlewares/protectRoutes")
const { createPost, deletePost, commentOnPost, LikeController, getAllPosts, GetAllLikedPostsByUser, getFollowingPost, getUserPost } = require("../controllers/postController")
const router = express.Router()

router.get("/all",protectedRoute,getAllPosts)
router.get("/user/:username",protectedRoute,getUserPost)
router.get("/following",protectedRoute,getFollowingPost)
router.get("/LikedPosts/:id",protectedRoute,GetAllLikedPostsByUser)
router.post("/create",protectedRoute,createPost)
router.post("/likes/:id",protectedRoute,LikeController)
router.post("/comment/:id",protectedRoute,commentOnPost)
router.delete("/:id",protectedRoute,deletePost)

module.exports = router