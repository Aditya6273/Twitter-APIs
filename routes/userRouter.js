const express =  require('express')
const { protectedRoute } = require('../middlewares/protectRoutes')
const { getUserProfile, followController, getSuggestedUsers, updateUserProfile } = require('../controllers/userContoller')
const router = express.Router()

router.get('/profile/:username',protectedRoute,getUserProfile)
router.get('/suggested',protectedRoute,getSuggestedUsers)
router.post('/follow/:id',protectedRoute,followController)
router.post("/update",protectedRoute,updateUserProfile)
module.exports = router