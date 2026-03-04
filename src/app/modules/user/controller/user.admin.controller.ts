import { RequestHandler } from "express";

import { sendSuccess } from "../../../../utils/sendSuccess.js";
import {
  blockUsers,
  deleteUsers,
  unblockUsers,
} from "../services/user.admin.service.js";

/**
 * Batch block users based on an array of IDs.
 */
export const blockUsersController: RequestHandler = async (req, res) => {
  const { ids } = req.body;
  const message = await blockUsers(ids);

  sendSuccess(res, { message });
};

/**
 * Batch unblock users based on an array of IDs.
 */
export const unblockUsersController: RequestHandler = async (req, res) => {
  const { ids } = req.body;
  const message = await unblockUsers(ids);

  sendSuccess(res, { message });
};

/**
 * Batch delete users based on an array of IDs.
 */
export const deleteUsersController: RequestHandler = async (req, res) => {
  const { ids } = req.body;
  const message = await deleteUsers(ids);

  sendSuccess(res, { message });
};
