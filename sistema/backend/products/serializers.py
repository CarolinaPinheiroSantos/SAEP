from rest_framework import serializers
from .models import Product, StockMovement


class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = ['id', 'product', 'movement_type', 'amount', 'performed_by', 'notes', 'created_at']
        read_only_fields = ['performed_by']


class ProductSerializer(serializers.ModelSerializer):
    movements = StockMovementSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'sku', 'description', 'quantity', 'min_quantity', 'created_at', 'movements']
        read_only_fields = ['created_at']

    def validate_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError('O nome do produto é obrigatório.')
        return value

    def validate_quantity(self, value):
        try:
            val = int(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError('A quantidade deve ser um número inteiro.')
        if val < 0:
            raise serializers.ValidationError('A quantidade não pode ser negativa.')
        return val

    def validate_min_quantity(self, value):
        try:
            val = int(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError('O estoque mínimo deve ser um número inteiro.')
        if val < 0:
            raise serializers.ValidationError('O estoque mínimo não pode ser negativo.')
        return val