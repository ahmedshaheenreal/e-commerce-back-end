import Joi from "joi";
// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~`|}{[\]:;"'<>,.?/-])[A-Za-z\d!@#$%^&*()_+~`|}{[\]:;"'<>,.?/-]{8,30}$/;

export function validateUserSignUp(user: object) {
  const schema = Joi.object({
    firstName: Joi.string().alphanum().min(2).max(15).required().messages({
      "string.base": "First name must be a text value",
      "string.alphanum": "First name can only contain letters and numbers",
      "string.min": "First name must be at least 2 characters",
      "string.max": "First name must not exceed 15 characters",
      "any.required": "First name is required",
    }),

    lastName: Joi.string().alphanum().min(2).max(15).required().messages({
      "string.base": "Last name must be a text value",
      "string.alphanum": "Last name can only contain letters and numbers",
      "string.min": "Last name must be at least 2 characters",
      "string.max": "Last name must not exceed 15 characters",
      "any.required": "Last name is required",
    }),

    address: Joi.string().min(5).max(100).required().messages({
      "string.base": "Address must be a text value",
      "string.min": "Address must be at least 5 characters",
      "string.max": "Address must not exceed 100 characters",
      "any.required": "Address is required",
    }),

    email: Joi.string()
      .email({
        minDomainSegments: 1,
        tlds: { allow: ["com", "net", "org", "io"] },
      })
      .required()
      .messages({
        "string.email": "Please enter a valid email address",
        "any.required": "Email is required",
      }),

    role: Joi.string().valid("user").required().messages({
      "any.only": "Invalid role value",
      "any.required": "Role is required",
    }),

    phone: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Phone number must be a valid international number",
        "any.required": "Phone number is required",
      }),

    dateOfBirth: Joi.string().required().messages({
      "any.required": "Date of birth is required",
    }),

    password: Joi.string()
      .pattern(/^[a-zA-Z0-9]{3,30}$/)
      .min(6)
      .max(30)
      .required()
      .messages({
        "string.pattern.base": "Password can only contain letters and numbers",
        "string.min": "Password must be at least 6 characters",
        "string.max": "Password must not exceed 30 characters",
        "any.required": "Password is required",
      }),
  });

  const { value, error } = schema.validate(user);

  return { value, error };
}
export function validateUserUpdate(user: object) {
  const schema = Joi.object({
    firstName: Joi.string().alphanum().min(2).max(15).required(),
    lastName: Joi.string().alphanum().min(2).max(15).required(),
    address: Joi.string().min(20).max(100).required(),
    email: Joi.string()
      .email({
        minDomainSegments: 1,
        tlds: { allow: ["com", "net", "org", "io"] },
      })
      .required(),
    role: Joi.string().valid("user").required(),
    phone: Joi.string()
      .required()
      .pattern(/^\+?[1-9]\d{1,14}$/),

    dateOfBirth: Joi.string().required(),
  });

  const { value, error } = schema.validate(user);

  return { value, error };
}

export function validateMerchantSignUp(user: object) {
  const schema = Joi.object({
    name: Joi.string().trim().min(6).max(35).required(),
    businessAddress: Joi.string().trim().min(10).max(255).required(),
    businessName: Joi.string().trim().min(3).max(100).required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net", "org", "io"] },
      })
      .required(),
    role: Joi.string().valid("merchant").required(),
    phone: Joi.string()
      .required()
      .pattern(/^\+?[1-9]\d{1,14}$/),

    dateOfBirth: Joi.string().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .min(6)
      .max(30)
      .required(),
  });

  const { value, error } = schema.validate(user);

  return { value, error };
}

export function validateLoginUser(user: object) {
  const schema = Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net", "org", "io"] },
      })
      .required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .min(6)
      .max(30)
      .required(),
    role: Joi.string().valid("user").required(),
  });
  const { value, error } = schema.validate(user);
  return { value, error };
}
