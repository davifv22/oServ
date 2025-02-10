import * as SetoresRepostory from "../repositories/setores_repository";
import * as HttpResponse from "../utils/http_helper";

export const getSetoresService = async () => {
  const data = await SetoresRepostory.getSetores();
  let response = null;

  if (data && Array.isArray(data)) {
    response = await HttpResponse.ok(data);
  } else {
    response = await HttpResponse.noContent();
  }

  return response;
};