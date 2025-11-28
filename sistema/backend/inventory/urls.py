from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from products import views as prod_views
from . import views as inventory_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = routers.DefaultRouter()
router.register(r'products', prod_views.ProductViewSet, basename='product')
router.register(r'movements', prod_views.StockMovementViewSet, basename='movement')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/me/', inventory_views.MeView.as_view(), name='me'),
]
