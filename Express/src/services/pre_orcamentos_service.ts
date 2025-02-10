import * as PreOrcamentosRepostory from "../repositories/pre_orcamentos_repository";
import * as HttpResponse from "../utils/http_helper";

export const getPreOrcamentosService = async () => {
  const data = await PreOrcamentosRepostory.getPreOrcamentos();
  let response = null;

  if (data && Array.isArray(data)) {
    response = await HttpResponse.ok(data);
  } else {
    response = await HttpResponse.noContent();
  }

  return response;
};