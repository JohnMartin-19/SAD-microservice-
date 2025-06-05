# main-app/m_farm/auth.py
import redis
import os
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed  # Correct import
import logging

logger = logging.getLogger(__name__)

class RedisTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]
        redis_client = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            decode_responses=True
        )

        token_key = f"token:{token}"
        token_data = redis_client.hgetall(token_key)
        if not token_data:
            logger.error(f"Token {token} not found in Redis")
            raise AuthenticationFailed('Invalid token')

        user = type('User', (), {
            'id': token_data['user_id'],
            'pk': token_data['user_id'],
            'username': token_data['username'],
            'is_authenticated': True
        })()
        logger.info(f"Authenticated user {user.username} with token {token}")
        return (user, token)