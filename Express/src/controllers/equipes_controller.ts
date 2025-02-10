import { Request, Response } from "express";
import * as service from "../services/equipes_service";

export const getEquipes = async (req: Request, res: Response) => {
  const httpResponse = await service.getEquipesService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};