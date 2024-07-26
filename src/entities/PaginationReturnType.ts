import ModelReturnTypes from "./ModelReturnTypes";

interface Info {
    hasNextPage: boolean;
    itemsCount: number;
}

interface PaginationReturnTypes<D={}, E={}> extends ModelReturnTypes<D, E> {
    info: Info
}

export default PaginationReturnTypes;