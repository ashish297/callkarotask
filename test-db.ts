import { executeQuery } from "./lib/clickhouse";

async function main() {
    try {
        const res = await executeQuery("SELECT * FROM calls LIMIT 5");
        console.log("Cols:", Object.keys(res[0]));
        
        const models = await executeQuery("SELECT trim(configuration) as conf, count(*) FROM calls GROUP BY conf LIMIT 10");
        console.log("Configurations:", models);
        
        const agents = await executeQuery("SELECT trim(agent) as a, count(*) FROM calls GROUP BY a LIMIT 10");
        console.log("Agents:", agents);
        
        const providers = await executeQuery("SELECT distinct tts_provider FROM calls LIMIT 10").catch(() => null);
        console.log("TTS Providers:", providers);
    } catch (e) {
        console.error(e);
    }
}
main();
