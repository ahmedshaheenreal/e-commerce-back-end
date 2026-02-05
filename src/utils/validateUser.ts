import Joi from "joi";
// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~`|}{[\]:;"'<>,.?/-])[A-Za-z\d!@#$%^&*()_+~`|}{[\]:;"'<>,.?/-]{8,30}$/;

export function validateUserSignUp(user: object) {
  const schema = Joi.object({
    firstName: Joi.string().alphanum().min(2).max(15).required(),
    lastName: Joi.string().alphanum().min(2).max(15).required(),
    address: Joi.string().min(5).max(100).required(),
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
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
      .min(6)
      .max(30)
      .required()
      .optional(),
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
