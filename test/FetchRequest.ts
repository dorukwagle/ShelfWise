import {FilterParamsType} from "../src/validations/FilterParams";
import {RequestOptions} from "node:http";
import {BookFilterType} from "../src/validations/BookFilter";
// import fetch, {RequestInit} from "node-fetch";

interface Options {
    headers: Headers;
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: {}
}

class FetchRequest {
    private readonly url: string;
    private readonly options: Options;
    private subRoute: string = "";

    constructor(url: string) {
        this.url = url;
        this.options = {
            headers: new Headers(),
        }
    }

    setDefaultHeaders = () => {
        this.options.headers = new Headers({
            "Content-Type": "application/json",
            "Accept": "application/json",
        });
        return this;
    }

    reset = () => {
        this.options.body = null as any;
        return this;
    }

    setCookie = (name: string, value: string) => {
        this.options.headers.set('Cookie', `${name}=${value}`);
        return this;
    }

    setSubroute = (name: string) => {
        this.subRoute = name;
        return this;
    }

    private getRoute = () => {
        const route = this.url + this.subRoute;
        this.subRoute = "";
        return route;
    }

    setHeaders = (headers: Headers) => {
        this.options.headers = headers;
        return this;
    }

    post = async (params: string = '', data?: any, multipart=false) => {
        this.options.method = "POST";
        this.options.body = multipart? data : JSON.stringify(data || {});
        return fetch(`${this.getRoute()}/${params}`, this.options as RequestInit);
    }

    get = async (params: string = '', query?: FilterParamsType & BookFilterType) => {
        this.options.method = "GET";
        let queryParams:{[key: string]: any} = {};

        Object.keys(query || {}).forEach((key: string) => {
            // @ts-ignore
            queryParams[key] = query[key];
        });
        return fetch(`${this.getRoute()}/${params}${new URLSearchParams(queryParams)}`, this.options as RequestInit);
    }

    put = async (params: string = '', data?: any) => {
        this.options.method = "PUT";
        this.options.body = JSON.stringify(data || {});
        return fetch(`${this.getRoute()}/${params}`, this.options as RequestInit);
    }

    delete = async (params: string = '') => {
        this.options.method = "DELETE";
        return fetch(`${this.getRoute()}/${params}`, this.options as RequestInit);
    }
}

export default FetchRequest;