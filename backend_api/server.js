const express = require('express');
const multer = require('multer');
const { Pool } = require('pg');
const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, PutItemCommand, GetItemCommand, ScanCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

// Conexiones robustas a contenedores
const pool = new Pool({ user: 'admin', host: 'rds-postgres', database: 'lomax_db', password: 'password123', port: 5432 });

// El SDK de AWS V3 a veces falla resolviendo nombres de Docker en Alpine, forzamos la resolución al bridge
const awsConfig = { endpoint: 'http://localstack_lomax:4566', region: 'us-east-1', forcePathStyle: true, credentials: { accessKeyId: 'test', secretAccessKey: 'test' } };
const s3 = new S3Client(awsConfig);
const lambda = new LambdaClient(awsConfig);
const dynamodb = new DynamoDBClient({ endpoint: 'http://dynamodb-local:8000', region: 'us-east-1', credentials: { accessKeyId: 'test', secretAccessKey: 'test' } });

const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') cb(null, true);
        else cb(new Error('Formato no permitido'), false);
    }
});

// GET /categorias
app.get('/categorias', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM categorias');
        res.status(200).json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /productos
app.post('/productos', async (req, res) => {
    const { codigo, nombre, descripcion, precio, categoria_id, atributos } = req.body;
    if (!codigo || !nombre || precio === undefined || !categoria_id) return res.status(400).json({ error: 'Faltan campos obligatorios' });
    
    const producto_id = `P_${uuidv4().substring(0,6)}`;
    
    try {
        await pool.query(
            "INSERT INTO productos (producto_id, codigo, nombre, descripcion, precio, categoria_id, estado) VALUES ($1, $2, $3, $4, $5, $6, 'PENDIENTE')",
            [producto_id, codigo, nombre, descripcion, precio, categoria_id]
        );

        const item = { producto_id: { S: producto_id }, imagen_original_key: { S: 'PENDIENTE' }, estado_procesamiento: { S: 'PENDIENTE' } };
        if (atributos) {
            for (const [key, value] of Object.entries(atributos)) item[key] = { S: value.toString() };
        }
        await dynamodb.send(new PutItemCommand({ TableName: 'ProductosAtributos', Item: item }));

        res.status(201).json({ producto_id, estado: 'PENDIENTE' });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Codigo de producto duplicado' });
        res.status(400).json({ error: err.message });
    }
});

async function procesarPublicacion(producto_id, clave) {
    const payload = JSON.stringify({ producto_id, bucket: 'lomax-originales', clave });
    const response = await lambda.send(new InvokeCommand({ FunctionName: 'procesarImagen', Payload: payload }));
    const result = JSON.parse(new TextDecoder().decode(response.Payload));
    
    if (result.statusCode !== 200) throw new Error('Fallo en Lambda: ' + result.body);

    const ddbRes = await dynamodb.send(new GetItemCommand({ TableName: 'ProductosAtributos', Key: { producto_id: { S: producto_id } } }));
    if (ddbRes.Item && ddbRes.Item.estado_procesamiento.S === 'LISTA') {
        await pool.query("UPDATE productos SET estado = 'PUBLICADO' WHERE producto_id = $1", [producto_id]);
        return true;
    }
    return false;
}

// POST /productos/{id}/imagen
app.post('/productos/:id/imagen', (req, res) => {
    upload.single('imagen')(req, res, async (err) => {
        if (err) {
            if (err.message === 'Formato no permitido') return res.status(415).json({ error: err.message });
            if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Archivo mayor a 5 Mb' });
            return res.status(400).json({ error: err.message });
        }
        
        const { id } = req.params;
        const clave = `${id}_original.jpg`;

        try {
            await s3.send(new PutObjectCommand({ Bucket: 'lomax-originales', Key: clave, Body: req.file.buffer, ContentType: req.file.mimetype }));
            await dynamodb.send(new UpdateItemCommand({
                TableName: 'ProductosAtributos', Key: { producto_id: { S: id } },
                UpdateExpression: "SET imagen_original_key = :k", ExpressionAttributeValues: { ":k": { S: clave } }
            }));

            await procesarPublicacion(id, clave);
            res.status(200).json({ estado: 'PUBLICADO' });
        } catch (error) {
            console.error(error);
            res.status(502).json({ error: 'Fallo servicio dependiente', paso: error.message, estado: 'PENDIENTE' });
        }
    });
});

// POST /productos/{id}/reprocesar
app.post('/productos/:id/reprocesar', async (req, res) => {
    const { id } = req.params;
    const clave = `${id}_original.jpg`;
    try {
        await s3.send(new HeadObjectCommand({ Bucket: 'lomax-originales', Key: clave }));
        await procesarPublicacion(id, clave);
        res.status(200).json({ estado: 'PUBLICADO' });
    } catch (err) {
        if (err.name === 'NotFound') return res.status(409).json({ error: 'No existe original' });
        res.status(502).json({ error: 'Fallo servicio dependiente', paso: err.message, estado: 'PENDIENTE' });
    }
});

// GET /productos
app.get('/productos', async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM productos WHERE estado = 'PUBLICADO'");
        const ddbRes = await dynamodb.send(new ScanCommand({ TableName: 'ProductosAtributos' }));
        
        const combinados = rows.map(prod => {
            const attrs = ddbRes.Items.find(item => item.producto_id.S === prod.producto_id);
            let formatoAttrs = {};
            if (attrs) {
                for (const [k, v] of Object.entries(attrs)) if (k !== 'producto_id') formatoAttrs[k] = v.S;
            }
            return { ...prod, atributos: formatoAttrs };
        });
        res.status(200).json(combinados);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /productos/{id}[cite: 1]
app.get('/productos/:id', async (req, res) => {
    try {
        const { rows } = await pool.query("SELECT * FROM productos WHERE producto_id = $1", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Producto no existe' });
        
        const ddbRes = await dynamodb.send(new GetItemCommand({ TableName: 'ProductosAtributos', Key: { producto_id: { S: req.params.id } } }));
        let formatoAttrs = {};
        if (ddbRes.Item) {
            for (const [k, v] of Object.entries(ddbRes.Item)) if (k !== 'producto_id') formatoAttrs[k] = v.S;
        }
        res.status(200).json({ ...rows[0], atributos: formatoAttrs });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /productos/{id}/imagen[cite: 1]
app.get('/productos/:id/imagen', async (req, res) => {
    try {
        const clave = `${req.params.id}_miniatura.jpg`;
        const { Body, ContentType } = await s3.send(new GetObjectCommand({ Bucket: 'lomax-miniaturas', Key: clave }));
        res.setHeader('Content-Type', ContentType || 'image/jpeg');
        Body.pipe(res);
    } catch (err) {
        if (err.name === 'NoSuchKey') return res.status(404).json({ error: 'Miniatura no disponible' });
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log('API escuchando en puerto 3000'));