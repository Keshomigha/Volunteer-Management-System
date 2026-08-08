const errorHandler = (err, req, res, next) => {
  // Log the error stack in development or when critical
  console.error("Global Error Handler Catch:", err.message || err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = null;

  // 1. Handle Sequelize Validation and Unique Constraint Errors
  if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    statusCode = 400;
    message = "Validation failed on database constraints";
    errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // 2. Handle Sequelize General Database Constraint Errors (like foreign keys)
  else if (err.name === "SequelizeDatabaseError" || err.name === "SequelizeForeignKeyConstraintError") {
    statusCode = 400;
    message = err.parent?.message || err.original?.message || err.message || "Database constraint violation";
    if (err.parent) {
      if (err.parent.code === "ER_NO_REFERENCED_ROW_2") {
        message = "The referenced parent record does not exist (Foreign Key Constraint Failed).";
      } else if (err.parent.code === "ER_ROW_IS_REFERENCED_2") {
        message = "Cannot delete or update parent row due to foreign key references.";
      } else if (err.parent.code === "ER_DUP_ENTRY") {
        message = "A duplicate entry already exists in the database.";
      }
    }
  }

  // 3. Handle JSON Web Token Errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Access denied. Invalid signature token.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Access denied. Authorization token has expired.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
