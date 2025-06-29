from django.contrib import admin
from .models import *
from unfold.admin import ModelAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin, GroupAdmin as BaseGroupAdmin
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm

# Register your models here.
try: 
    admin.site.unregister(CustomUser)
    admin.site.unregister(Consultant)
except admin.sites.NotRegistered:
    pass
     
@admin.register(CustomUser)
class CustomUserAdmin(BaseUserAdmin, ModelAdmin):
    # Ensure these forms from unfold.forms are used for proper styling
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm

    # Customize list_display, search_fields, fieldsets, etc. for your CustomUser
    # Example fields based on a common CustomUser setup (adjust as needed):
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    # If your CustomUser doesn't use username, remove it from fieldsets
    # Also, ensure correct fields are shown/edited.
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    # Remove 'username' if your CustomUser doesn't have it
    # If your CustomUser uses a different USERNAME_FIELD, adjust fieldsets accordingly.


# --- Standard registration for other models (like Consultant) ---
@admin.register(Consultant)
class ConsultantAdmin(ModelAdmin): # Inherit directly from Unfold's ModelAdmin
    list_display = ('name', 'specialty', 'cost')
    list_filter = ('specialty',) 
    search_fields = ('name', 'email', 'specialty') 
    # Add any other ModelAdmin options here as needed for your Consultant model
    # e.g., fieldsets, inlines, etc.

# Optional: If you also want to style the default Django Group model (if you're using it)
# Make sure django.contrib.auth.models.Group is imported if you want to customize it.
from django.contrib.auth.models import Group
try:
    admin.site.unregister(Group)
except admin.sites.NotRegistered:
    pass

@admin.register(Group)
class GroupAdmin(BaseGroupAdmin, ModelAdmin):
    pass