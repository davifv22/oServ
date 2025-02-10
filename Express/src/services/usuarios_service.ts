import * as UsuariosRepostory from "../repositories/usuarios_repository";
import * as HttpResponse from "../utils/http_helper";

export const getUsuariosService = async () => {
  const data = await UsuariosRepostory.getUsuarios();
  let response = null;

  if (data && Array.isArray(data)) {
    response = await HttpResponse.ok(data);
  } else {
    response = await HttpResponse.noContent();
  }

  return response;
};