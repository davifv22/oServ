import * as BoletosRepostory from "../repositories/boletos_repository";
import * as HttpResponse from "../utils/http_helper";

export const getBoletosService = async () => {
  const data = await BoletosRepostory.getBoletos();
  let response = null;

  if (data && Array.isArray(data)) {
    response = await HttpResponse.ok(data);
  } else {
    response = await HttpResponse.noContent();
  }

  return response;
};