const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const Jimp = require('jimp');

const s3 = new S3Client({ endpoint: 'http://host.docker.internal:4566', region: 'us-east-1', forcePathStyle: true });
const dynamodb = new DynamoDBClient({ endpoint: 'http://host.docker.internal:8000', region: 'us-east-1' });

exports.handler = async (event) => {
    const { producto_id, bucket, clave } = event;
    const outKey = `${producto_id}_miniatura.jpg`; // Clave de salida determinista por imagen para evitar duplicados

    try {
        if (!clave.toLowerCase().endsWith('.jpg') && !clave.toLowerCase().endsWith('.png')) {
            throw new Error("Formato no permitido. Solo JPEG o PNG.");
        }

        const getObjectParams = { Bucket: bucket, Key: clave };
        const { Body } = await s3.send(new GetObjectCommand(getObjectParams));
        const imageBuffer = await streamToBuffer(Body);

        if (imageBuffer.length > 5 * 1024 * 1024) {
            throw new Error("Archivo mayor a 5 Mb");
        }

        const image = await Jimp.read(imageBuffer);
        image.scaleToFit(300, 300); // Produce una miniatura proporcional de máximo 300 x 300 píxeles
        const resizedBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

        await s3.send(new PutObjectCommand({
            Bucket: 'lomax-miniaturas',
            Key: outKey,
            Body: resizedBuffer,
            ContentType: 'image/jpeg'
        }));

        await updateDynamo(producto_id, outKey, 'LISTA');

        return { statusCode: 200, body: 'Miniatura creada con exito' };
    } catch (error) {
        console.error(error);
        await updateDynamo(producto_id, 'N/A', 'ERROR');
        return { statusCode: 500, body: 'Error: ' + error.message };
    }
};

const streamToBuffer = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
});

const updateDynamo = async (id, miniatura, estado) => {
    await dynamodb.send(new UpdateItemCommand({
        TableName: 'ProductosAtributos',
        Key: { producto_id: { S: id } },
        UpdateExpression: "SET miniatura_key = :m, estado_procesamiento = :e",
        ExpressionAttributeValues: {
            ":m": { S: miniatura },
            ":e": { S: estado }
        }
    }));
};