"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class FetchRequest {
    constructor(url) {
        this.subRoute = "";
        this.setDefaultHeaders = () => {
            this.options.headers = new Headers({
                "Content-Type": "application/json",
                "Accept": "application/json",
            });
            return this;
        };
        this.reset = () => {
            this.options.body = null;
            return this;
        };
        this.setCookie = (name, value) => {
            this.options.headers.set('Cookie', `${name}=${value}`);
            return this;
        };
        this.setSubroute = (name) => {
            this.subRoute = name;
            return this;
        };
        this.getRoute = () => {
            const route = this.url + this.subRoute;
            this.subRoute = "";
            return route;
        };
        this.setHeaders = (headers) => {
            this.options.headers = headers;
            return this;
        };
        this.post = (...args_1) => __awaiter(this, [...args_1], void 0, function* (params = '', data, multipart = false) {
            this.options.method = "POST";
            this.options.body = multipart ? data : JSON.stringify(data || {});
            return fetch(`${this.getRoute()}/${params}`, this.options);
        });
        this.get = (...args_1) => __awaiter(this, [...args_1], void 0, function* (params = '', query) {
            this.options.method = "GET";
            let queryParams = {};
            Object.keys(query || {}).forEach((key) => {
                // @ts-ignore
                queryParams[key] = query[key];
            });
            return fetch(`${this.getRoute()}/${params}${new URLSearchParams(queryParams)}`, this.options);
        });
        this.put = (...args_1) => __awaiter(this, [...args_1], void 0, function* (params = '', data) {
            this.options.method = "PUT";
            this.options.body = JSON.stringify(data || {});
            return fetch(`${this.getRoute()}/${params}`, this.options);
        });
        this.delete = (...args_1) => __awaiter(this, [...args_1], void 0, function* (params = '') {
            this.options.method = "DELETE";
            return fetch(`${this.getRoute()}/${params}`, this.options);
        });
        this.url = url;
        this.options = {
            headers: new Headers(),
        };
    }
}
exports.default = FetchRequest;
