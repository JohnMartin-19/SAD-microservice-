from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings
from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import json


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    
    def get(self,request,socialaccount):
        """
        this redirects the frontend after issuing the JWT Token
        
        """
        
        user = socialaccount.user
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        
        frontend_redirect_url = f'{settings.SOCIALACCOUNT_LOGIN_REDIRECT_URL}?'\
            f"access_token = {access_token}&"\
            f"refresh-token={refresh_token}"
            
    def pre_social_login(self,request,sociallogin):
        try:
            user = sociallogin.user
            if user.email:
                User = get_user_model()
                try:
                    existing_user = User.objects.get(email = user.email)
                    if not sociallogin.is_exsting:
                        sociallogin.connect(request,existing_user)
                except User.DoesNotExist:
                    pass
                
        except Exception as e:
            print('Error during login',{e})
            pass
                        
                
            
        