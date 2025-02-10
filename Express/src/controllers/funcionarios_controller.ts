import { Request, Response } from "express";
import * as service from "../services/funcionarios_service";

export const getFuncionarios = async (req: Request, res: Response) => {
  const httpResponse = await service.getFuncionariosService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};