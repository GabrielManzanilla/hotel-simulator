#!/bin/bash

echo "=========================================="
echo "📊 VERIFICACIÓN DE DATOS EN POSTGRESQL"
echo "=========================================="
echo ""

echo "📋 PROMOCIONES:"
sudo -u postgres psql -d hotel_db -c "SELECT id, name, discount_percentage, is_active FROM promotions ORDER BY id;"
echo ""

echo "🏨 HABITACIONES:"
sudo -u postgres psql -d hotel_db -c "SELECT room_id, type, name, base_price_per_night, available_count FROM rooms ORDER BY room_id;"
echo ""

echo "📞 DIRECTORIO TELEFÓNICO (primeros 5):"
sudo -u postgres psql -d hotel_db -c "SELECT area, name, extension FROM phone_directory ORDER BY area, name LIMIT 5;"
echo ""

echo "📊 RESUMEN:"
echo "Promociones: $(sudo -u postgres psql -d hotel_db -t -c 'SELECT COUNT(*) FROM promotions;' | xargs)"
echo "Habitaciones: $(sudo -u postgres psql -d hotel_db -t -c 'SELECT COUNT(*) FROM rooms;' | xargs)"
echo "Directorio: $(sudo -u postgres psql -d hotel_db -t -c 'SELECT COUNT(*) FROM phone_directory;' | xargs)"
echo "Reservaciones: $(sudo -u postgres psql -d hotel_db -t -c 'SELECT COUNT(*) FROM reservations;' | xargs)"
echo ""

echo "✅ Verificación completada"

