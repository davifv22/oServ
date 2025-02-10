import { Router } from "express";
import * as BoletosController from "./controllers/boletos_controller";
import * as BoletosServicosController from "./controllers/boletos_servicos_controller";
import * as ClientesController from "./controllers/clientes_controller";
import * as ControlesController from "./controllers/controles_controller";
import * as EmpresaController from "./controllers/empresa_controller";
import * as EquipesController from "./controllers/equipes_controller";
import * as FuncionariosController from "./controllers/funcionarios_controller";
import * as OrdensServicosController from "./controllers/ordens_servicos_controller";
import * as PreOrcamentosController from "./controllers/pre_orcamentos_controller";
import * as RequerimentosController from "./controllers/requerimentos_controller";
import * as ServicosController from "./controllers/servicos_controller";
import * as SetoresController from "./controllers/setores_controller";
import * as TiposRequerimentosController from "./controllers/tipos_requerimentos_controller";
import * as UsuariosController from "./controllers/usuarios_controller";
import * as VeiculosController from "./controllers/veiculos_controller";

const router = Router();

router.get("/boletos", BoletosController.getBoletos);
router.get("/boletos-servicos", BoletosServicosController.getBoletosServicos);
router.get("/clientes", ClientesController.getClientes);
router.get("/controles", ControlesController.getControles);
router.get("/empresa", EmpresaController.getEmpresa);
router.get("/equipes", EquipesController.getEquipes);
router.get("/funcionarios", FuncionariosController.getFuncionarios);
router.get("/ordens-servicos", OrdensServicosController.getOrdensServicos);
router.get("/pre-orcamentos", PreOrcamentosController.getPreOrcamentos);
router.get("/requerimentos", RequerimentosController.getRequerimentos);
router.get("/servicos", ServicosController.getServicos);
router.get("/setores", SetoresController.getSetores);
router.get("/tipos-requerimentos", TiposRequerimentosController.getTiposRequerimentos);
router.get("/usuarios", UsuariosController.getUsuarios);
router.get("/veiculos", VeiculosController.getVeiculos);

export default router;
