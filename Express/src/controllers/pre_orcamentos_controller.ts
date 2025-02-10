import { Request, Response } from "express";
import * as service from "../services/pre_orcamentos_service";

export const getPreOrcamentos = async (req: Request, res: Response) => {
  const httpResponse = await service.getPreOrcamentosService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};