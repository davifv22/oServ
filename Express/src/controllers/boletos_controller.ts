import { Request, Response } from "express";
import * as service from "../services/boletos_service";

export const getBoletos = async (req: Request, res: Response) => {
  const httpResponse = await service.getBoletosService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};