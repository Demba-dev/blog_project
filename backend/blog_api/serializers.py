from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Article, Comment, Category


#serializer pour les commentaires
class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'created_at']



#serializer pour les articles
class ArticleSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    category = serializers.SlugRelatedField(
        slug_field="name",
        queryset=Category.objects.all(),
        required=False,
        allow_null=True,
    )
    # Pour l'affichage côté frontend
    # category_name = serializers.CharField(source="category.name", read_only=True)
    is_favorite = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    view_count = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ['id', 'title', 'content', 'author', 'created_at', 'updated_at', 'comments', 'category', 'is_favorite','comments_count','view_count',]

    def get_is_favorite(self,obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return obj.favorites.filter(user=request.user).exists()
        return False
    
    def get_comments_count(self,obj):
        return obj.comments.count()
    
    def get_view_count(self, obj):
        return obj.view_count

#serializer pour les catégories
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'created_at']


# User serializer
class UserSerializer(serializers.ModelSerializer):
    comments_count = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    articles_count = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    

    class Meta:
        model = User
        fields = ['id', 'username', 'email',
                   'comments_count', 'first_name','last_name','bio', 'comments_count',
                     'likes_count', 'articles_count', ]
        read_only_fields = ['comments_count', 'likes_count', 'articles_count']

    def get_comments_count(self,obj):
        return Comment.objects.filter(author=obj).count()
    
    def get_likes_count(self,obj):
        return obj.likes.count() if hasattr(obj, "likes") else 0
    
    def get_articles_count(self, obj):
        return Article.objects.filter(author=obj).count()
    
    def get_bio(self, obj):
        if hasattr(obj, "profile") and obj.profile:
            return obj.profile.bio
        return ""
