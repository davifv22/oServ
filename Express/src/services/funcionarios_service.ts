import * as FuncionariosRepostory from "../repositories/funcionarios_repository";
import * as HttpResponse from "../utils/http_helper";

export const getFuncionariosService = async () => {
  const data = await FuncionariosRepostory.getFuncionarios();
  let response = null;

  if (data && Array.isArray(data)) {
    response = await HttpResponse.ok(data);
  } else {
    response = await HttpResponse.noContent();
  }

  return response;
};