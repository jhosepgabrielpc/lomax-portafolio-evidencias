$ids = docker exec -it rds-postgres psql -U admin -d lomax_db -t -c "SELECT producto_id FROM productos;"
$lista = $ids -split "`n" | Where-Object { $_.Trim() -ne "" }

foreach ($id in $lista) {
    $c = $id.Trim()
    
    # Subir a S3 en modo silencioso (--quiet) para evitar que la consola se congele
    aws s3 cp original.jpg "s3://lomax-miniaturas/${c}_miniatura.jpg" --endpoint-url http://localhost:4566 --region us-east-1 --quiet
    
    # Actualizar DynamoDB
    $json = '{"producto_id": {"S": "' + $c + '"}, "miniatura_key": {"S": "' + $c + '_miniatura.jpg"}, "estado_procesamiento": {"S": "LISTA"}}'
    aws dynamodb put-item --table-name ProductosAtributos --item $json --endpoint-url http://localhost:8000 --region us-east-1
}

# Actualizar PostgreSQL
docker exec -it rds-postgres psql -U admin -d lomax_db -c "UPDATE productos SET estado = 'PUBLICADO';"
Write-Host "¡Todas las imágenes subidas y catálogo publicado!" -ForegroundColor Cyan
