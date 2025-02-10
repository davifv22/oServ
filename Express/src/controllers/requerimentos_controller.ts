import { Request, Response } from "express";
import * as service from "../services/requerimentos_service";

export const getRequerimentos = async (req: Request, res: Response) => {
  const httpResponse = await service.getRequerimentosService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};