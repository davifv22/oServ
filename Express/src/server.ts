
import createApp from "./app";
import { checkAndCreateDatabase } from "../db/create_db";
import { logger } from "../logs/logger";

const app = createApp();
const port_api = process.env.PORT_API;

app.listen(port_api, async () => {
    logger.info(`🔥 Servidor iniciado na porta: http://localhost:${port_api}`);

    await checkAndCreateDatabase();
});
