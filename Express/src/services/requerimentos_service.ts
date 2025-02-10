import * as RequerimentosRepostory from "../repositories/requerimentos_repository";
import * as HttpResponse from "../utils/http_helper";

export const getRequerimentosService = async () => {
  const data = await RequerimentosRepostory.getRequerimentos();
  let response = null;

  if (data && Array.isArray(data)) {
    response = await HttpResponse.ok(data);
  } else {
    response = await HttpResponse.noContent();
  }

  return response;
};