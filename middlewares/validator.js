import Joi from "joi";
import mongoose from "mongoose";

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

const stockSchema = Joi.object({
  quantity: Joi.number().min(0).max(100).required(),
  unlimited: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

const objectId = () => {
  return Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId validation")
    .messages({
      "any.invalid": "Must be a valid MongoDB ObjectId",
    });
};

const createGameSchema = Joi.object({
  name: Joi.string().required().max(50),
  description: Joi.string().optional(),
  shortDescription: Joi.string().required().max(100),
  price: Joi.number().required(),
  discount: Joi.number().min(0).max(100).optional(),
  releaseDate: Joi.date().required(),
  stock: stockSchema,
});

const updateGameschema = Joi.object({
  name: Joi.string().max(50),
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

const updateProfileSchema = Joi.object({
  firstname: Joi.string().optional().trim().min(3).messages({
    "string-min": "firstname must contain at least 3 characters",
  }),
  lastname: Joi.string().optional().trim().min(3).messages({
    "string-min": "lastname must contain at least 3 characters",
  }),
  username: Joi.string().optional().trim().lowercase().min(3).messages({
    "string-min": "name must contain at least 3 letters",
  }),
}).min(1);

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

const updatePasswordSchema = Joi.object({
  oldPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
});

const addToCartSchema = Joi.object({
  gameId: objectId().required().messages({
    "any.required": "Game ID is required",
    "any.invalid": "Game ID must be a valid MongoDB ObjectId",
  }),
  quantity: Joi.number().integer().min(1).max(1000).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "number.max": "Quantity cannot exceed 1000",
    "any.required": "Quantity is required",
  }),
});

const updateCartSchema = Joi.object({
  gameId: objectId().required().messages({
    "any.required": "Game ID is required",
    "any.invalid": "Game ID must be a valid MongoDB ObjectId",
  }),
  quantity: Joi.number().integer().min(1).max(1000).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "number.max": "Quantity cannot exceed 1000",
    "any.required": "Quantity is required",
  }),
});

const removeItemSchema = Joi.object({
  itemId: objectId().required().messages({
    "any.required": "Item ID is required",
    "any.invalid": "Item ID must be a valid MongoDB ObjectId",
  }),
});

export default {
  createGameSchema,
  updateGameschema,
  signUpSchema,
  logInSchema,
  acceptCodeSchema,
  acceptForgotCodeSchema,
  updatePasswordSchema,
  updateProfileSchema,
  addToCartSchema,
  updateCartSchema,
  removeItemSchema,
};
