const MeetingHistory = require("../../model/schema/meeting");
const mongoose = require("mongoose");
const user = require("../../model/schema/user");
const { Contact } = require("../../model/schema/contact");
const { Lead } = require("../../model/schema/lead");

const add = async (req, res) => {
  try {
    const meeting = new MeetingHistory(req.body);
    await meeting.save();
    res.status(200).json(meeting);
  } catch (err) {
    console.error("Failed to create meeting:", err);
    res.status(400).json({ error: "Failed to create meeting", err });
  }
};

const index = async (req, res) => {
  try {
    const query = { ...req.query, deleted: false };
    const meetings = await MeetingHistory.find(query).populate(
      "createBy",
      "username"
    );
    const formattedMeetings = meetings.map((meeting) => ({
      ...meeting.toObject(),
      createdByName: meeting.createBy.username,
    }));

    res.status(200).json(formattedMeetings);
  } catch (err) {
    console.error("Failed to fetch meetings:", err);
    res.status(400).json({ error: "Failed to fetch meetings", err });
  }
};

const view = async (req, res) => {
  try {
    let meeting = await MeetingHistory.findById(req.params.id).populate([
      { path: "createBy", model: user },
      { path: "attendes", model: Contact },
      { path: "attendesLead", model: Lead },
    ]);
    if (!meeting) return res.status(404).json({ message: "No data found" });
    meeting = meeting.toObject();
    meeting.createdByName = meeting.createBy.username;
    res.status(200).json(meeting);
  } catch (err) {
    console.error("Failed to fetch meeting:", err);
    res.status(400).json({ error: "Failed to fetch meeting", err });
  }
};

const deleteData = async (req, res) => {
  try {
    const meeting = await MeetingHistory.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    res.status(200).json({ message: "Deleted successfully", meeting });
  } catch (err) {
    console.error("Failed to delete meeting:", err);
    res.status(400).json({ error: "Failed to delete meeting", err });
  }
};

const deleteMany = async (req, res) => {
  try {
    const result = await MeetingHistory.updateMany(
      { _id: { $in: req.body } },
      { $set: { deleted: true } }
    );
    res.status(200).json({ message: "Deleted successfully", result });
  } catch (err) {
    console.error("Failed to delete meetings:", err);
    res.status(400).json({ error: "Failed to delete meetings", err });
  }
};

module.exports = { add, index, view, deleteData, deleteMany };
