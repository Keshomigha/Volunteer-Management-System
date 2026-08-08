import express from "express";
import {
  getCertificates,
  issueCertificate,
  revokeCertificate,
  getEligibleVolunteers,
  generateCertificate,
  bulkGenerateCertificates,
  getMyCertificates,
  getCertificateById,
  downloadCertificate
} from "../controllers/certificateController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
  validateGenerateCertificate,
  validateBulkCertificate
} from "../middleware/validationMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Student only: retrieve own certificates list
router.get("/my-certificates", roleMiddleware("student"), getMyCertificates);

// Organizer only: retrieve eligible volunteers checklist
router.get("/eligible/:eventId", roleMiddleware("organizer"), getEligibleVolunteers);

// Organizer only: generate single certificate
router.post("/generate", roleMiddleware("organizer"), validateGenerateCertificate, generateCertificate);

// Organizer only: bulk generate certificates
router.post("/generate-bulk", roleMiddleware("organizer"), validateBulkCertificate, bulkGenerateCertificates);

// Student/Organizer/Admin: download dynamic PDF certificate
router.get("/:id/download", downloadCertificate);

// Student/Organizer/Admin: retrieve certificate detail record
router.get("/:id", getCertificateById);

// Backwards Compatibility / Dashboard Routes:
router.get("/", roleMiddleware("organizer"), getCertificates);
router.post("/", roleMiddleware("organizer"), issueCertificate);
router.delete("/:id", roleMiddleware("organizer"), revokeCertificate);

export default router;
