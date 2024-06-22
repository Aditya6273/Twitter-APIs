const User = require("../models/auth.model");
const notificationModel = require("../models/notification.model");
const bcrypt = require("bcryptjs")
const {v2:cloudinary}= require("cloudinary")
const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ message: "User Not Found" });
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in UserProfile :", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const followController = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    if (id === currentUserId.toString()) {
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow yourself" });
    }

    const [userToModify, currentUser] = await Promise.all([
      User.findById(id),
      User.findById(currentUserId),
    ]);

    if (!userToModify || !currentUser) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const isFollowing = currentUser.following.includes(id);
    const updateCurrentUser = isFollowing
      ? { $pull: { following: id } }
      : { $push: { following: id } };
    const updateUserToModify = isFollowing
      ? { $pull: { followers: currentUserId } }
      : { $push: { followers: currentUserId } };

    await Promise.all([
      User.findByIdAndUpdate(currentUserId, updateCurrentUser),
      User.findByIdAndUpdate(id, updateUserToModify),
    ]);
    if (!isFollowing) {
      const notification = new notificationModel({
        type: "follow",
        to: id,
        from: req.user._id,
      });
      await notification.save();
    }
    res.status(200).json({
      message: isFollowing
        ? "Unfollowed successfully"
        : "Followed successfully",
    });
  } catch (error) {
    console.error("Error in followController:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const userFollowedByMe = await User.findById(userId).select("following");
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);
    const filteredUser = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );
    const suggestedUser = filteredUser.slice(0, 4);
    suggestedUser.forEach((user) => {
      user.password = null;
    });
    res.status(200).json(suggestedUser);
  } catch (error) {
    console.log("Error in getSuggestedUsers", error.message);
    res.status(500).json({ error: error.message });
  }
};
const updateUserProfile = async (req, res) => {
  const { fullname, email, username, currentPassword, newPassword, bio } = req.body;
  let { profileImg, coverImg } = req.body;
  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    // Check if only one of the passwords is provided
    if ((!currentPassword && newPassword) || (!newPassword && currentPassword)) {
      return res.status(400).json({ message: "Please enter both current and new password" });
    }

    // Update password if both current and new passwords are provided
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Update profile image if provided
    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
      user.profileImg = profileImg;
    }

    // Update cover image if provided
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
      user.coverImg = coverImg;
    }

    // Update other fields
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
 

    user = await user.save();
    user.password = null;
    return res.status(200).json(user);

  } catch (error) {
    console.error("Error in UpdateProfile", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUserProfile, followController, getSuggestedUsers ,updateUserProfile};
