import { Request, Response } from "express";
import * as service from "../services/servicos_service";

export const getServicos = async (req: Request, res: Response) => {
  const httpResponse = await service.getServicosService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};