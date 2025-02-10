import { Request, Response } from "express";
import * as service from "../services/usuarios_service";

export const getUsuarios = async (req: Request, res: Response) => {
  const httpResponse = await service.getUsuariosService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};