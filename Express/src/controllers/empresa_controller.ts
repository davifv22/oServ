import { Request, Response } from "express";
import * as service from "../services/empresa_service";

export const getEmpresa = async (req: Request, res: Response) => {
  const httpResponse = await service.getEmpresaService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};