import * as VeiculosRepostory from "../repositories/veiculos_repository";
import * as HttpResponse from "../utils/http_helper";

export const getVeiculosService = async () => {
  const data = await VeiculosRepostory.getVeiculos();
  let response = null;

  if (data && Array.isArray(data)) {
    response = await HttpResponse.ok(data);
  } else {
    response = await HttpResponse.noContent();
  }

  return response;
};