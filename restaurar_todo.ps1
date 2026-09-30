$ids = docker exec -it rds-postgres psql -U admin -d lomax_db -t -c "SELECT producto_id FROM productos;"
$lista = $ids -split "`n" | Where-Object { $_.Trim() -ne "" }

foreach ($id in$lista) {
    $c =$id.Trim()
    
    aws s3 cp original.jpg "s3://lomax-miniaturas/${c}_miniatura.jpg" --endpoint-url http://localhost:4566 --region us-east-1 --quiet
    
    $jsonContent = "{ `"producto_id`": {`"S`": `"$c`"}, `"miniatura_key`": {`"S`": `"${c}_miniatura.jpg`"}, `"estado_procesamiento`": {`"S`": `"LISTA`"} }"
    Set-Content -Path "temp.json" -Value $jsonContent -Encoding UTF8
    
    aws dynamodb put-item --table-name ProductosAtributos --item file://temp.json --endpoint-url http://localhost:8000 --region us-east-1
}

Remove-Item -Path "temp.json" -ErrorAction SilentlyContinue
docker exec -it rds-postgres psql -U admin -d lomax_db -c "UPDATE productos SET estado = 'PUBLICADO';"
Write-Host "¡TODO EL ENTORNO RESTAURADO, PRODUCTOS CON IMAGEN Y PUBLICADOS!" -ForegroundColor Green
