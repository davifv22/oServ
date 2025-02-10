import * as EquipesRepostory from "../repositories/equipes_repository";
import * as HttpResponse from "../utils/http_helper";

export const getEquipesService = async () => {
  const data = await EquipesRepostory.getEquipes();
  let response = null;

  if (data && Array.isArray(data)) {
    response = await HttpResponse.ok(data);
  } else {
    response = await HttpResponse.noContent();
  }

  return response;
};