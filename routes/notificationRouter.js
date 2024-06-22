const express = require("express")
const { protectedRoute } = require("../middlewares/protectRoutes")
const { getAllNotifications, deleteNotifications, deleteNotification } = require("../controllers/notificationController")
const router = express.Router()


router.get("/",protectedRoute,getAllNotifications)
router.delete("/",protectedRoute,deleteNotifications)
router.delete("/:id",protectedRoute,deleteNotification)


module.exports = router