import { Request, Response } from "express";
import * as service from "../services/ordens_servicos_service";

export const getOrdensServicos = async (req: Request, res: Response) => {
  const httpResponse = await service.getOrdensServicosService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};