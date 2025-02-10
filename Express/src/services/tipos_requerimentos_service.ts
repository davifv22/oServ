import * as TiposRequerimentosRepostory from "../repositories/tipos_requerimentos_repository";
import * as HttpResponse from "../utils/http_helper";

export const getTiposRequerimentosService = async () => {
  const data = await TiposRequerimentosRepostory.getTiposRequerimentos();
  let response = null;

  if (data && Array.isArray(data)) {
    response = await HttpResponse.ok(data);
  } else {
    response = await HttpResponse.noContent();
  }

  return response;
};