export const validateRegistration = (req, res, next) => {
  const { role, name, email, password, phone, clubName, contactNumber, studentId, faculty } = req.body;

  // Common validations
  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "A valid email is required" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }
  if (!role || !["student", "organizer", "admin"].includes(role)) {
    return res.status(400).json({ message: "A valid role (student, organizer, or admin) is required" });
  }

  if (role === "student") {
    const finalName = name || req.body.fullName;
    if (!finalName) {
      return res.status(400).json({ message: "Full Name is required for student" });
    }
    if (!faculty) {
      return res.status(400).json({ message: "Faculty is required for student" });
    }
    if (studentId && !/^STU\d{6}$/.test(studentId)) {
      return res.status(400).json({ message: "Student ID must be in format STU123456" });
    }
  } else if (role === "organizer") {
    const finalOrgName = clubName || req.body.organizationName || name;
    if (!finalOrgName) {
      return res.status(400).json({ message: "Club/Organization Name is required for organizer" });
    }
    const finalPhone = phone || contactNumber;
    if (!finalPhone) {
      return res.status(400).json({ message: "Contact Number is required for organizer" });
    }
    // Phone validation regex allowing +, spaces, digits, parentheses, dashes
    const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
    if (!phoneRegex.test(finalPhone)) {
      return res.status(400).json({ message: "Invalid contact number format" });
    }

    } else if (role === "admin") {
    if (!name) {
      return res.status(400).json({ message: "Name is required for admin" });
    }

       if (!req.body.accessCode) {
      return res.status(400).json({ message: "Admin access code is required" });
    }
    if (req.body.accessCode !== "admin123" && req.body.accessCode !== "VOMS_ADMIN_2026") {
      return res.status(400).json({ message: "Invalid admin access code" });
    }
    if (!req.body.department) {
      return res.status(400).json({ message: "Department is required for admin" });
    }

  }

  next();
};

export const validateStudentRegistration = (req, res, next) => {
  const { name, email, password, phone, studentId, faculty } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "A valid email is required" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }
  if (!name) {
    return res.status(400).json({ message: "Full Name is required for student" });
  }
  if (!faculty) {
    return res.status(400).json({ message: "Faculty is required for student" });
  }
  if (phone) {
    const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }
  }
  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required" });
  }
  if (!/^STU\d{6}$/.test(studentId)) {
    return res.status(400).json({ message: "Student ID must be in format STU123456" });
  }

  next();
};

export const validateOrganizerRegistration = (req, res, next) => {
  const { organizationName, email, password, phone } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "A valid email is required" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }
  if (!organizationName) {
    return res.status(400).json({ message: "Club/Organization Name is required for organizer" });
  }
  if (!phone) {
    return res.status(400).json({ message: "Contact Number is required for organizer" });
  }

  // Phone validation regex allowing +, spaces, digits, parentheses, dashes
  const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid contact number format" });
  }

  next();
};

export const validateApplication = (req, res, next) => {
  const { eventId, formData } = req.body;

  if (!eventId) {
    return res.status(400).json({ message: "Event ID is required" });
  }

  if (!formData) {
    return res.status(400).json({ message: "Form data is required" });
  }

  const { phone, skills, experience, motivation } = formData;

  if (!phone) {
    return res.status(400).json({ message: "Phone number is required in form responses" });
  }

  const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number format in form responses" });
  }

  if (!skills) {
    return res.status(400).json({ message: "Skills description is required in form responses" });
  }

  if (!experience) {
    return res.status(400).json({ message: "Experience description is required in form responses" });
  }

  if (!motivation) {
    return res.status(400).json({ message: "Motivation description is required in form responses" });
  }

  next();
};

export const validateMarkAttendance = (req, res, next) => {
  const { eventId, userId, status } = req.body;

  if (!eventId) {
    return res.status(400).json({ message: "Event ID is required" });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!status || !["Present", "Absent"].includes(status)) {
    return res.status(400).json({ message: "Status must be either 'Present' or 'Absent'" });
  }

  next();
};

export const validateBulkMarkAttendance = (req, res, next) => {
  const { eventId } = req.body;
  const attendees = req.body.attendees || req.body.records;

  if (!eventId) {
    return res.status(400).json({ message: "Event ID is required" });
  }

  if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
    return res.status(400).json({ message: "Attendees array is required and cannot be empty" });
  }

  for (const item of attendees) {
    if (!item.userId) {
      return res.status(400).json({ message: "User ID is required for each attendee record" });
    }
    if (!item.status || !["Present", "Absent"].includes(item.status)) {
      return res.status(400).json({ message: "Status must be either 'Present' or 'Absent' for each attendee record" });
    }
  }

  next();
};

export const validateGenerateCertificate = (req, res, next) => {
  const { eventId, userId, hours } = req.body;

  if (!eventId) {
    return res.status(400).json({ message: "Event ID is required" });
  }

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (hours === undefined || hours === null || isNaN(hours) || Number(hours) <= 0) {
    return res.status(400).json({ message: "Completed hours must be a positive number" });
  }

  next();
};

export const validateBulkCertificate = (req, res, next) => {
  const { eventId, volunteers } = req.body;

  if (!eventId) {
    return res.status(400).json({ message: "Event ID is required" });
  }

  if (!volunteers || !Array.isArray(volunteers) || volunteers.length === 0) {
    return res.status(400).json({ message: "Volunteers array is required and cannot be empty" });
  }

  for (const item of volunteers) {
    if (!item.userId) {
      return res.status(400).json({ message: "User ID is required for each volunteer" });
    }
  }

  next();
};

export const validateEvent = (req, res, next) => {
  const { title, description, location, eventDate, volunteerRequired, reputationPoints, image } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ message: "Event title is required" });
  }

  if (!description || typeof description !== "string" || description.trim() === "") {
    return res.status(400).json({ message: "Event description is required" });
  }

  if (!location || typeof location !== "string" || location.trim() === "") {
    return res.status(400).json({ message: "Event location is required" });
  }

  if (!eventDate) {
    return res.status(400).json({ message: "Event date is required" });
  }

  const dateStr = typeof eventDate === "string" ? eventDate.split("T")[0] : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({ message: "Event date must be in YYYY-MM-DD format" });
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (req.method === "POST" && selectedDate < today) {
    return res.status(400).json({ message: "Event date cannot be in the past" });
  }

  if (volunteerRequired === undefined || volunteerRequired === null || isNaN(volunteerRequired) || Number(volunteerRequired) <= 0) {
    return res.status(400).json({ message: "Volunteer count required must be a positive number" });
  }

  if (reputationPoints !== undefined && reputationPoints !== null) {
    if (isNaN(reputationPoints) || Number(reputationPoints) < 0) {
      return res.status(400).json({ message: "Reputation points must be a positive number" });
    }
  }

  if (image) {
    if (typeof image !== "string") {
      return res.status(400).json({ message: "Invalid banner image format" });
    }

    const isUrl = image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/");
    const isBase64 = image.startsWith("data:image/");
    if (!isUrl && !isBase64) {
      return res.status(400).json({ message: "Banner image must be a valid URL, path, or base64 image payload" });
    }

    if (image.length > 10 * 1024 * 1024) {
      return res.status(400).json({ message: "Banner image size must be under 10MB" });
    }
  }

  next();
};

export const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ success: false, message: "A valid email address is required" });
  }
  next();
};

export const validateResetPassword = (req, res, next) => {
  const { newPassword } = req.body;
  const token = req.params.token || req.body.token;

  if (!token) {
    return res.status(400).json({ success: false, message: "Password reset token is required" });
  }
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
  }
  next();
};

export const validateVerifyOtp = (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ success: false, message: "A valid email address is required" });
  }
  if (!otp || typeof otp !== "string" || otp.trim().length !== 6) {
    return res.status(400).json({ success: false, message: "A 6-digit OTP code is required" });
  }
  next();
};

export const validateResetPasswordWithOtp = (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ success: false, message: "A valid email address is required" });
  }
  if (!otp || typeof otp !== "string" || otp.trim().length !== 6) {
    return res.status(400).json({ success: false, message: "A 6-digit OTP code is required" });
  }
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
  }
  next();
};

