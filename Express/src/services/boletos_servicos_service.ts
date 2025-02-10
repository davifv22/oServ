import * as BoletosServicosRepostory from "../repositories/boletos_servicos_repository";
import * as HttpResponse from "../utils/http_helper";

export const getBoletosServicosService = async () => {
  const data = await BoletosServicosRepostory.getBoletosServicos();
  let response = null;

  if (data && Array.isArray(data)) {
    response = await HttpResponse.ok(data);
  } else {
    response = await HttpResponse.noContent();
  }

  return response;
};