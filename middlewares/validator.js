import Joi from "joi";

const firstNameSchema = Joi.string().required().trim().min(3).messages({
  "string-min": "firstname must contain at least 3 characters",
});

const lastNameSchema = Joi.string().required().trim().min(3).messages({
  "string-min": "lastname must contain at least 3 characters",
});

const usernameSchema = Joi.string()
  .required()
  .trim()
  .lowercase()
  .min(3)
  .messages({
    "string-min": "name must contain at least 3 letters",
  });

const PASSWORD_PATTERN = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
);

const PASSWORD_MESSAGE =
  "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character";

const emailSchema = Joi.string()
  .min(6)
  .max(60)
  .required()
  .email({
    tlds: { allow: ["com", "net"] },
  });

const passwordSchema = Joi.string()
  .required()
  .pattern(PASSWORD_PATTERN)
  .messages({
    "string-pattern-base": PASSWORD_MESSAGE,
  });

const emailCodeSchema = Joi.number().required();
// const addressSchema = Joi.object({
//   type: Joi.string().valid("shipping", "billing").required().messages({
//     "any.only": "Address type must be either 'shipping' or 'billing'",
//     "any.required": "Address type is required",
//   }),
//   street: Joi.string().required().trim().min(5).messages({
//     "string.min": "Street address must contain at least 5 characters",
//     "any.required": "Street address is required",
//   }),
//   city: Joi.string().required().trim().min(2).messages({
//     "string.min": "City must contain at least 2 characters",
//     "any.required": "City is required",
//   }),
//   state: Joi.string().required().trim().min(2).max(50).messages({
//     "string.min": "State must contain at least 2 characters",
//     "string.max": "State must not exceed 50 characters",
//     "any.required": "State is required",
//   }),
//   zipCode: Joi.string()
//     .required()
//     .trim()
//     .pattern(/^[0-9]{5}(-[0-9]{4})?$/)
//     .messages({
//       "string.pattern.base": "Zip code must be in format 12345 or 12345-6789",
//       "any.required": "Zip code is required",
//     }),
//   country: Joi.string()
//     .trim()
//     .default("US")
//     .valid("US", "CA", "MX", "UK", "DE", "FR", "IT", "ES", "AU", "JP")
//     .messages({
//       "any.only": "Country must be a valid country code",
//     }),
// });

const createGameSchema = Joi.object({
  title: Joi.string().required().max(50),
  description: Joi.string().required(),
  shortDescription: Joi.string().required().max(100),
  price: Joi.number().required(),
  discount: Joi.number().min(0).max(100).optional(),
  releaseDate: Joi.string().required(),
});

const updateGameschema = Joi.object({
  title: Joi.string().max(50),
  description: Joi.string().min(100),
  shortDescription: Joi.string().max(100),
  price: Joi.number(),
  discount: Joi.number().min(0).max(100).optional(),
});

const signUpSchema = Joi.object({
  firstname: firstNameSchema,
  lastname: lastNameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

const logInSchema = Joi.object({
  email: emailSchema,
  password: passwordSchema,
});

const acceptCodeSchema = Joi.object({
  email: emailSchema,
  emailCode: emailCodeSchema,
});

const acceptForgotCodeSchema = Joi.object({
  email: emailSchema,
  emailCode: emailCodeSchema,
  newPassword: passwordSchema,
});

const resetPasswordSchema = Joi.object({
  oldPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
});

export default {
  createGameSchema,
  updateGameschema,
  signUpSchema,
  logInSchema,
  acceptCodeSchema,
  acceptForgotCodeSchema,
  resetPasswordSchema,
};
