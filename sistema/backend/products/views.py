from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Product, StockMovement
from django.db import models
from .serializers import ProductSerializer, StockMovementSerializer
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action
from datetime import datetime # NOVO IMPORT

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('name')
    serializer_class = ProductSerializer
    # AllowAny for development convenience; switch back to IsAuthenticated in production
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Product.objects.all().order_by('name')
        search = self.request.query_params.get('search') or self.request.query_params.get('q')
        if search:
            return qs.filter(models.Q(name__icontains=search) | models.Q(sku__icontains=search))
        return qs

    @action(detail=True, methods=['post'])
    def adjust(self, request, pk=None):
        product = self.get_object()
        
        # --- 1. Validação de Quantidade (Amount) ---
        try:
            # Tenta converter o 'amount'. Se for inválido, cai no 'except'
            amount = int(request.data.get('amount', 0))
        except ValueError:
            return Response({'amount': 'A quantidade deve ser um número inteiro válido.'}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response({'amount': 'A quantidade deve ser maior que zero.'}, status=status.HTTP_400_BAD_REQUEST)
        
        mtype = request.data.get('movement_type', StockMovement.ENTRY)

        # --- 2. Lógica de Ajuste e Prevenção de Estoque Negativo ---
        if mtype == StockMovement.ENTRY:
            product.quantity += amount
        else:
            # Validação para evitar que a saída deixe o estoque negativo
            if product.quantity < amount:
                return Response({'amount': f'A saída de {amount} excede o estoque atual de {product.quantity}.'}, status=status.HTTP_400_BAD_REQUEST)
            product.quantity -= amount
            
        product.save()
        
        # --- PROCESSAR DATA DA MOVIMENTAÇÃO (REQUISITO 7.1.3) ---
        movement_date_str = request.data.get('movement_date')
        movement_date = None
        if movement_date_str:
            try:
                # Converte a string YYYY-MM-DD do input para objeto datetime do Python
                movement_date = datetime.strptime(movement_date_str, '%Y-%m-%d')
            except ValueError:
                # Se for inválido, o model usará o default (timezone.now)
                pass 
        # --- FIM PROCESSAMENTO DATA ---
        
        # --- 3. Atribuição do Usuário e Criação do Movimento ---
        # Verifica se o usuário está autenticado antes de atribuir ao campo ForeignKey.
        # Se for um AnonymousUser (não logado), define como None (permitido pelo model).
        user_to_assign = request.user if request.user.is_authenticated else None
        
        # Criar movimento
        StockMovement.objects.create(
            product=product, 
            movement_type=mtype, 
            amount=amount, 
            performed_by=user_to_assign,
            notes=request.data.get('notes',''),
            created_at=movement_date # CAMPO DE DATA ADICIONADO AQUI
        )
        
        serializer = self.get_serializer(product)
        return Response(serializer.data)

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.select_related('product').all()
    serializer_class = StockMovementSerializer
    # AllowAny for development convenience; switch back to IsAuthenticated in production
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        data = request.data
        # validate required fields
        try:
            amount = int(data.get('amount') if data.get('amount') is not None else 0)
        except (ValueError, TypeError):
            return Response({'amount': 'A quantidade deve ser um número inteiro.'}, status=status.HTTP_400_BAD_REQUEST)
        if amount <= 0:
            return Response({'amount': 'A quantidade deve ser maior que zero.'}, status=status.HTTP_400_BAD_REQUEST)

        mtype = data.get('movement_type')
        if mtype not in (StockMovement.ENTRY, StockMovement.EXIT):
            return Response({'movement_type': 'Tipo de movimentação inválido.'}, status=status.HTTP_400_BAD_REQUEST)

        product_id = data.get('product')
        if not product_id:
            return Response({'product': 'Produto obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, pk=product_id)

        # Prevent negative stock on exit
        if mtype == StockMovement.EXIT and product.quantity < amount:
            return Response({'amount': f'A saída de {amount} excede o estoque atual de {product.quantity}.'}, status=status.HTTP_400_BAD_REQUEST)

        # adjust stock
        if mtype == StockMovement.ENTRY:
            product.quantity += amount
        else:
            product.quantity -= amount
        product.save()

        # parse created_at if provided (ISO format)
        created_at = None
        if data.get('created_at'):
            try:
                # let model/serializer parse ISO; store raw string in serializer creation
                created_at = data.get('created_at')
            except Exception:
                created_at = None

        user_to_assign = request.user if request.user.is_authenticated else None

        movement = StockMovement.objects.create(
            product=product,
            movement_type=mtype,
            amount=amount,
            performed_by=user_to_assign,
            notes=data.get('notes', ''),
            created_at=created_at or None
        )

        alerta = False
        if mtype == StockMovement.EXIT and product.quantity < product.min_quantity:
            alerta = True

        movement_ser = self.get_serializer(movement)
        product_ser = ProductSerializer(product, context={'request': request})
        return Response({'movement': movement_ser.data, 'product': product_ser.data, 'alerta_estoque_minimo': alerta}, status=status.HTTP_201_CREATED)