import { Request, Response } from "express";
import * as service from "../services/setores_service";

export const getSetores = async (req: Request, res: Response) => {
  const httpResponse = await service.getSetoresService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};