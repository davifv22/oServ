import { Request, Response } from "express";
import * as service from "../services/clientes_service";

export const getClientes = async (req: Request, res: Response) => {
  const httpResponse = await service.getClientesService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};