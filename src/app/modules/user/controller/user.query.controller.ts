import { RequestHandler } from "express";
import { sendSuccess } from "../../../../utils/sendSuccess.js";
import { getParam } from "../../../../utils/expressParams.js";
import { getUser, getUsers } from "../services/user.query.service.js";

/**
 * Retrieves a list of users with pagination and filtering.
 * Passes the entire req.query to the repository via the service.
 */
export const getUsersController: RequestHandler = async (req, res) => {
  const { data, meta } = await getUsers(req.query);

  sendSuccess(res, {
    message: "Users retrieved successfully",
    data: { users: data, meta },
  });
};

/**
 * Retrieves a single user profile.
 * Dynamically parses "include" query params to fetch extra related data.
 */
export const getUserController: RequestHandler = async (req, res) => {
  const id = getParam(req.params.id);

  const extraFields = req.query.include
    ? (req.query.include as string).split(",")
    : [];

  const user = await getUser({ id }, extraFields as any);

  sendSuccess(res, {
    message: "User profile retrieved successfully",
    data: user,
  });
};
