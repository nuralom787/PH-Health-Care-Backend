import app from "./app";
// const PORT = process.env.PORT;

const bootstrap = () => {
    try {
        app.listen(5000, () => {
            console.log(`Server is running on http://localhost:5000`);
        });
    }
    catch (error) {
        console.error("Field to start server: ", error);
    }
};

bootstrap();