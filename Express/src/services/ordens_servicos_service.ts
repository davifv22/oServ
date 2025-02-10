import * as OrdensServicosRepostory from "../repositories/ordens_servicos_repository";
import * as HttpResponse from "../utils/http_helper";

export const getOrdensServicosService = async () => {
  const data = await OrdensServicosRepostory.getOrdensServicos();
  let response = null;

  if (data && Array.isArray(data)) {
    response = await HttpResponse.ok(data);
  } else {
    response = await HttpResponse.noContent();
  }

  return response;
};