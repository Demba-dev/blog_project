from django.urls import path
from .views import ArticleListView, ArticleDetailView, CommentListCreateView, CategoryListView, CategoryArticlesView, ProfileView, UserArticlesView, toggle_favorite


urlpatterns = [
    path('articles/', ArticleListView.as_view(), name='article-list'),
    path('articles/<int:pk>/', ArticleDetailView.as_view(), name='article-detail'),
    path('articles/<int:pk>/comments/', CommentListCreateView.as_view(), name='add-comment'),
    path('articles/my/', UserArticlesView.as_view(), name='user-articles'),

    # New URL patterns for categories
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('categories/<int:pk>/articles/', CategoryArticlesView.as_view(), name='category-articles'),

    # Profile endpoint
    path('auth/profile/', ProfileView.as_view(), name='user-profile'),

    # Favorite Urls
    path("articles/<int:article_id>/favorite/", toggle_favorite, name="toggle_favorite"),

]
