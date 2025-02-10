import { Request, Response } from "express";
import * as service from "../services/boletos_servicos_service";

export const getBoletosServicos = async (req: Request, res: Response) => {
  const httpResponse = await service.getBoletosServicosService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};