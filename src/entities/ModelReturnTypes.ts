export interface ModelReturnTypes<D = {}, E = {}> {
    error: E;
    statusCode: number;
    data: D;
}

export default ModelReturnTypes;