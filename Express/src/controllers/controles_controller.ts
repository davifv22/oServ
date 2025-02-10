import { Request, Response } from "express";
import * as service from "../services/controles_service";

export const getControles = async (req: Request, res: Response) => {
  const httpResponse = await service.getControlesService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};