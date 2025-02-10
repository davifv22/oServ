import { Request, Response } from "express";
import * as service from "../services/tipos_requerimentos_service";

export const getTiposRequerimentos = async (req: Request, res: Response) => {
  const httpResponse = await service.getTiposRequerimentosService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};