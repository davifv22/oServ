import { Request, Response } from "express";
import * as service from "../services/veiculos_service";

export const getVeiculos = async (req: Request, res: Response) => {
  const httpResponse = await service.getVeiculosService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};