import { IRequestUser } from "./interface&types";

declare global {
    namespace Express {
        interface Request {
            user: IRequestUser
        };
    };
};