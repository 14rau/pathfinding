import fetch from "node-fetch";


export class ApiController{
    constructor(private apiport, private apihost, private protocoll) {}

    private async baseRequest(path: string, data, type: string) {
        try {
            let res = await fetch(`${this.protocoll}://${this.apihost}:${this.apiport}/${path}`, {
                method: type,
                mode: "cors",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
            let json = await res.json();
            this.log(
                `[API][${type}] (${new Date().toLocaleString("de")}) ${this.protocoll}://${this.apihost}:${this.apiport}/${path} -> ${res.status}`,
                data,
                res.status,
                json
            );
            return json;
        } catch (err) {
            alert("Sorry, an error occured")
        }
    }

    private log(message: string, data: object, status: number, res: object) {
        let color = "\x1b[35m";
        if (status >= 200 && status < 300) {
            color = "\x1b[32m";
        } else if (status >= 400 && status < 500) {
            color = "\x1b[33m";
        } else if (status >= 500 && status < 600) {
            color = "\x1b[31m";
        }

        // tslint:disable-next-line:no-console
        console.log(
            color,
            message,
            "\x1b[37m",
            process.env.debug ? JSON.stringify(data) : "",
            process.env.debug ? res : ""
        ); //  "Respose: " + JSON.stringify(res)
    }

    public async delete(path: string, data) {
        return await this.baseRequest(path, data, "DELETE");
    }

    public async put(path: string, data) {
        return await this.baseRequest(path, data, "PUT");
    }

    public async post(path: string, data) {
        return await this.baseRequest(path, data, "POST");
    }

    public async get(path: string) {
        let res = await  fetch(`${this.protocoll}://${this.apihost}:${this.apiport}/${path ? path : ""}`, {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            }
        });
        let json = await res.json();
        this.log(
            `[API][GET] (${new Date().toLocaleString("de")}) ${this.protocoll}://${this.apihost}:${this.apiport}/${path} -> ${res.status}`,
            null,
            res.status,
            json
        );
        return json;
    }
}