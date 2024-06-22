const Notification = require("../models/notification.model");

const getAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in getAllNotifications Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNotifications Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const deleteNotification = async (req, res) => {
  try {
    const { id: notifyId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(notifyId)

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    if (notification.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({
          message: "You are not authorized to delete this notification",
        });
    }
    await Notification.findByIdAndDelete(notifyId)
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error in deleteNotification Controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { deleteNotification };

module.exports = {
  getAllNotifications,
  deleteNotifications,
  deleteNotification,
};
