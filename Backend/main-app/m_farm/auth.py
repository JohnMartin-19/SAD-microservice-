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
            logger.error(f"Token {token} not found in Redis (key: {token_key})")
            raise AuthenticationFailed('Invalid token')

        # --- CRITICAL DEBUGGING LINES ---
        logger.info(f"--- Debugging Redis Token Data ---")
        logger.info(f"Retrieved token_data for key '{token_key}': {token_data}")

        user_id_from_redis = token_data.get('user_id')
        username_from_redis = token_data.get('username')

        logger.info(f"User ID from Redis: '{user_id_from_redis}' (type: {type(user_id_from_redis)})")
        logger.info(f"Username from Redis: '{username_from_redis}' (type: {type(username_from_redis)})")

        if not username_from_redis:
            logger.warning(f"Username retrieved from Redis for token '{token}' is empty or None!")
        # --- END CRITICAL DEBUGGING LINES ---

        # Ensure that user_id is converted to int if it's stored as string in Redis
        # This is important for Django ORM if you're using IntegerField for user_id
        try:
            user_id = int(user_id_from_redis) if user_id_from_redis else None
        except (ValueError, TypeError):
            logger.error(f"Could not convert user_id '{user_id_from_redis}' to integer.")
            raise AuthenticationFailed('Invalid user ID format in token')

        user = type('User', (), {
            'id': user_id,
            'pk': user_id,
            'username': username_from_redis, # This is the value that's currently empty
            'is_authenticated': True
        })()
        logger.info(f"Authenticated user '{user.username}' (ID: {user.id}) with token {token}") # Adjusted f-string for clarity
        return (user, token)