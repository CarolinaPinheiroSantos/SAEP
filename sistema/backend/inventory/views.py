from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return Response({'detail':'Not authenticated'}, status=401)
        return Response({'id': user.id, 'username': getattr(user,'username',None), 'email': getattr(user,'email',None)})
