import * as EmpresaRepostory from "../repositories/empresa_repository";
import * as HttpResponse from "../utils/http_helper";

export const getEmpresaService = async () => {
  const data = await EmpresaRepostory.getEmpresa();
  let response = null;

  if (data && Array.isArray(data)) {
    response = await HttpResponse.ok(data);
  } else {
    response = await HttpResponse.noContent();
  }

  return response;
};