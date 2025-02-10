import * as ClientesRepostory from "../repositories/clientes_repository";
import * as HttpResponse from "../utils/http_helper";

export const getClientesService = async () => {
  const data = await ClientesRepostory.getClientes();
  let response = null;

  if (data && Array.isArray(data)) {
    response = await HttpResponse.ok(data);
  } else {
    response = await HttpResponse.noContent();
  }

  return response;
};