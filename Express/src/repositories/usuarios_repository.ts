import { UsuariosModel } from "../models/usuarios_model";

export const fetchAndLogUsers = async () => {
  try {
    // Recupera todos os usuários
    const users = await UsuariosModel.findAll();

    // Verifica se todos os itens retornados são instâncias de UsuariosModel
    console.log(users.every(user => user instanceof UsuariosModel)); // true

    // Log dos usuários em formato JSON
    console.log('All users:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
  }
};

