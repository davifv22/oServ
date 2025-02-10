import * as ServicosRepostory from "../repositories/servicos_repository";
import * as HttpResponse from "../utils/http_helper";

export const getServicosService = async () => {
  const data = await ServicosRepostory.getServicos();
  let response = null;

  if (data && Array.isArray(data)) {
    response = await HttpResponse.ok(data);
  } else {
    response = await HttpResponse.noContent();
  }

  return response;
};