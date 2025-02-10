import * as ControlesRepostory from "../repositories/controles_repository";
import * as HttpResponse from "../utils/http_helper";

export const getControlesService = async () => {
  const data = await ControlesRepostory.getControles();
  let response = null;

  if (data && Array.isArray(data)) {
    response = await HttpResponse.ok(data);
  } else {
    response = await HttpResponse.noContent();
  }

  return response;
};