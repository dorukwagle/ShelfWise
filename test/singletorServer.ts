import app from "../src/app";


const serverInstance = (port: number | string) => {
    return app.listen(process.env.PORT || 3000);
}

declare const globalThis: {
    serverGlobal: ReturnType<typeof serverInstance> | null;
} & typeof global;



const startServer = (port: number | string) => {
    const server = globalThis.serverGlobal ?? serverInstance(port);
    globalThis.serverGlobal = server;
    return server;
}

const stopServer = () => {
    if(globalThis.serverGlobal) globalThis.serverGlobal.close();
    globalThis.serverGlobal = null;
}

export {
    startServer,
    stopServer,
}