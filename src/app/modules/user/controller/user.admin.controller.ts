import { RequestHandler } from "express";
import * as userAdminServices from "../services/user.admin.service.js";
import { sendSuccess } from "../../../../utils/sendSuccess.js";

/**
 * Batch block users based on an array of IDs.
 */
export const blockUsersController: RequestHandler = async (req, res) => {
  const { ids } = req.body;
  const message = await userAdminServices.blockUsers(ids);

  sendSuccess(res, { message });
};

/**
 * Batch unblock users based on an array of IDs.
 */
export const unblockUsersController: RequestHandler = async (req, res) => {
  const { ids } = req.body;
  const message = await userAdminServices.unblockUsers(ids);

  sendSuccess(res, { message });
};

/**
 * Batch delete users based on an array of IDs.
 */
export const deleteUsersController: RequestHandler = async (req, res) => {
  const { ids } = req.body;
  const message = await userAdminServices.deleteUsers(ids);

  sendSuccess(res, { message });
};
