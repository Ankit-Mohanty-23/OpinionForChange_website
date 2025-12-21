export const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) {
      const bodyResult = schema.body.safeParse(req.body);
      if (!bodyResult.success) {
        return res.status(400).json({
          success: false,
          errors: bodyResult.error.issues.map((e) => e.message),
        });
      }
      req.body = bodyResult.data;
    }

    if (schema.params) {
      const paramsResult = schema.params.safeParse(req.params);
      if (!paramsResult.success) {
        return res.status(400).json({
          success: false,
          errors: paramsResult.error.issues.map((e) => e.message),
        });
      }
      req.params = paramsResult.data;
    }

    if (schema.user) {
      const userResult = schema.user.safeParse(req.user);
      if (!userResult.success) {
        return res.status(400).json({
          success: false,
          errors: userResult.error.issues.map((e) => e.message),
        });
      }
      req.user = userResult.data;
    }
    next();
  } catch (err) {
    console.log("Validation Error: ", err);
    return res.status(500).json({
      success: false,
      msg: "Failed to Validate created Post",
    });
  }
};

export const validateFile = (schema) => (req, res, next) => {
  if (!schema.file) return next();

  if (!req.file) {
    return res.status(400).json({
      success: false,
      errors: ["File is required"],
    });
  }

  const result = schema.file.safeParse(req.file);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.issues.map((e) => e.message),
    });
  }

  next();
};
