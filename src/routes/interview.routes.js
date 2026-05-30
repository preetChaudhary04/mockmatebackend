const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middlewares");
const { upload } = require("../middlewares/file.middlewares");
const {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
} = require("../controllers/interview.controllers");

/**
 * @route POST /api/interview
 * @description Generate new interview report on the basis of resume PDF, user selfDescription,and jobDescription
 * @access Private
 */
router.post(
  "/",
  authMiddleware,
  upload.single("resume"),
  generateInterViewReportController,
);

/**
 * @route GET /api/interview/report/:interviewId
 * @description Get interview report of a user by interviewId
 * @access Private
 */
router.get(
  "/report/:interviewId",
  authMiddleware,
  getInterviewReportByIdController,
);

/**
 * @route GET /api/interview
 * @description Get all interview reports of a user
 * @access Private
 */
router.get("/", authMiddleware, getAllInterviewReportsController);

module.exports = router;
