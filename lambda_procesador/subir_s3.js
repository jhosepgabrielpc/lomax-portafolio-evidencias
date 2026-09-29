const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const s3 = new S3Client({ endpoint: 'http://localhost:4566', region: 'us-east-1', forcePathStyle: true });
async function upload() {
    await s3.send(new PutObjectCommand({ Bucket: 'lomax-originales', Key: 'P014.jpg', Body: fs.readFileSync('../original.jpg') }));
    await s3.send(new PutObjectCommand({ Bucket: 'lomax-originales', Key: 'P015.txt', Body: fs.readFileSync('../invalido.txt') }));
    console.log('Archivos subidos con exito a LocalStack');
}
upload();
