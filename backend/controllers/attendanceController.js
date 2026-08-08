import * as attendanceService from "../services/attendanceService.js";

/**
 * Organizer gets all approved attendees with current attendance status.
 */
export const getAttendeesForEvent = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.params.id;
    const attendees = await attendanceService.getAttendeesForEvent(eventId, req.user.id);
    res.status(200).json(attendees);
  } catch (error) {
    next(error);
  }
};

/**
 * Organizer marks attendance for a single volunteer.
 */
export const markAttendance = async (req, res, next) => {
  try {
    const { eventId, userId, status } = req.body;
    const record = await attendanceService.markAttendance(eventId, userId, status, req.user.id);
    res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
      record
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Organizer bulk marks attendance for multiple volunteers.
 */
export const bulkMarkAttendance = async (req, res, next) => {
  try {
    const { eventId } = req.body;
    const attendeesList = req.body.attendees || req.body.records;
    const result = await attendanceService.bulkMarkAttendance(eventId, attendeesList, req.user.id);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Student retrieves their own attendance records.
 */
export const getMyAttendance = async (req, res, next) => {
  try {
    const records = await attendanceService.getStudentAttendance(req.user.id);
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves attendance detail record by ID.
 */
export const getAttendanceById = async (req, res, next) => {
  try {
    const record = await attendanceService.getAttendanceById(req.params.id, req.user.id, req.user.role);
    res.status(200).json(record);
  } catch (error) {
    next(error);
  }
};

/**
 * Organizer retrieves statistics.
 */
export const getAttendanceStats = async (req, res, next) => {
  try {
    const stats = await attendanceService.getAttendanceStats(req.user.id);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

// Backwards Compatibility Aliases
export const getAttendanceByEvent = getAttendeesForEvent;
export const saveAttendance = bulkMarkAttendance;
