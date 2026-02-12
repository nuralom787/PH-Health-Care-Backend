import app from "./app";
import { env } from "./config/env";
// const PORT = process.env.PORT;

const bootstrap = () => {
    try {
        app.listen(env.PORT, () => {
            console.log(`Server is running on http://localhost:${env.PORT}`);
        });
    }
    catch (error) {
        console.error("Field to start server: ", error);
    }
};

bootstrap();