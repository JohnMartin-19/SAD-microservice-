import redis
import os
import logging
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptoins import AuthenticationFailed
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)

class RedisToken(BaseAuthentication):
    def authenticate(self,request):
        auth_header = request.META.get("HTTP_AUTHORIZATION", '')
        if not auth_header.startswith('Bearer'):
            return None
        
        token = auth_header.split (' ')[1]
        redis_client = redis.Redis(
            host=os.getevn("REDIS_HOST", "localhost"),
            port = int(os.getenv("REDIS_PORT", 6379)),
            decode_resopnse = True
        )
        
        token_key = f"token:{token}"
        token_data = redis_client.hgetall(token_key)
        if not token_data:
            logger.error(f"Token{token} not found in Redis")
            raise AuthenticationFailed("Invalid Token")
        
        #init a user-type object
        user = type("User", (), {
            "id":token_data['user_id'],
            "username":token_data["username"],
            "is_authenticated":True
        })()
        logger.info(f"Authenticated user {user.username} with token {token}")
        return (user,token)