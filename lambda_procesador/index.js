const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { Client } = require("pg");

const dynamo = new DynamoDBClient({ endpoint: "http://host.docker.internal:8000", region: "us-east-1" });

exports.handler = async (event) => {
    try {
        const record = event.Records[0];
        const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
        const id = srcKey.replace("_miniatura.jpg", "").replace(".jpg", "");
        
        if (!id) throw new Error("ID no válido: " + srcKey);

        await updateDynamo(id, srcKey);
        await updatePostgres(id);

        console.log(`Producto ${id} procesado y publicado.`);
        return { statusCode: 200, body: "Exito" };
    } catch (error) {
        console.error("Error en Lambda:", error);
        throw error;
    }
};

async function updateDynamo(id, key) {
    await dynamo.send(new PutItemCommand({
        TableName: "ProductosAtributos",
        Item: {
            "producto_id": { S: id },
            "miniatura_key": { S: key },
            "estado_procesamiento": { S: "LISTA" }
        }
    }));
}

async function updatePostgres(id) {
    const client = new Client({
        host: "host.docker.internal",
        user: "admin",
        password: "password123",
        database: "lomax_db",
        port: 5432
    });
    await client.connect();
    await client.query("UPDATE productos SET estado = 'PUBLICADO' WHERE producto_id = $1", [id]);
    await client.end();
}
