import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  createAddressHandler,
  deleteAddressHandler,
  getAddressByIdHandler,
  getMyAddressesHandler,
  updateAddressHandler,
} from "./address.controller.js";

export const addressRoutes = Router();

addressRoutes.use(authMiddleware);

addressRoutes.post("/", createAddressHandler);
addressRoutes.get("/my", getMyAddressesHandler);
addressRoutes.get("/:id", getAddressByIdHandler);
addressRoutes.patch("/:id", updateAddressHandler);
addressRoutes.delete("/:id", deleteAddressHandler);
