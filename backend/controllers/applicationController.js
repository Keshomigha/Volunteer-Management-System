import * as applicationService from "../services/applicationService.js";

/**
 * Student applies for an event.
 */
export const applyToEvent = async (req, res, next) => {
  try {
    const { eventId, formData } = req.body;
    const application = await applicationService.applyToEvent(req.user.id, eventId, formData);
    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Student retrieves their own applications.
 */
export const getMyApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getStudentApplications(req.user.id);
    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves application details by ID (Student, Organizer, or Admin).
 */
export const getApplicationById = async (req, res, next) => {
  try {
    const application = await applicationService.getApplicationById(req.params.id, req.user.id, req.user.role);
    res.status(200).json(application);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves applications for a specific event (Organizer only).
 */
export const getOrganizerApplications = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const applications = await applicationService.getOrganizerApplications(eventId, req.user.id);
    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

/**
 * Organizer approves a student's application.
 */
export const approveApplication = async (req, res, next) => {
  try {
    const application = await applicationService.approveApplication(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: "Application approved successfully",
      application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Organizer rejects a student's application.
 */
export const rejectApplication = async (req, res, next) => {
  try {
    const application = await applicationService.rejectApplication(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: "Application rejected successfully",
      application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Organizer retrieves applications statistics.
 */
export const getApplicationStats = async (req, res, next) => {
  try {
    const stats = await applicationService.getOrganizerApplicationStats(req.user.id);
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};
