from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from .models import Favorite
from django.contrib.auth.models import User


from .models import Article, Comment, Category
from .serializers import ArticleSerializer, CommentSerializer, CategorySerializer, UserSerializer


# Profile view
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True, context={'request':request})  # partial=True pour mettre à jour seulement certains champs
        if serializer.is_valid():
            serializer.save()

            bio = request.data.get('bio',None)
            if bio is not None:
                profile = getattr(user, 'profile',None)
                if profile:
                    profile.bio = bio
                    profile.save()

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Liste des articles et création d'un nouvel article
class ArticleListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        articles = Article.objects.all().order_by('-created_at')
        serializer = ArticleSerializer(articles, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = ArticleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

# Détail, mise à jour et suppression d'un article
class ArticleDetailView(APIView):
    def get(self, request, pk):
        article = get_object_or_404(Article, pk=pk)

        # Incrementer view_count
        article.view_count +=1
        article.save(update_fields=['view_count'])


        serializer = ArticleSerializer(article, context={'request':request})
        return Response(serializer.data)
    
    def put(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        serializer = ArticleSerializer(article, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(author=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        article.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Liste des commentaires pour un article et création d'un nouveau commentaire
class CommentListCreateView(APIView):
    permission_classes = [IsAuthenticated]


    def post(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(author=request.user, article=article)

            # Mettre a jour le compteur de commentaire 
            article.comments_count = article.comments.count() # type: ignore
            article.save()


            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get(self, request, pk):
        article = get_object_or_404(Article, pk=pk)
        comments = article.comments.all().order_by('-created_at') # type: ignore
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)




# category list view
class CategoryListView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class CategoryArticlesView(APIView):
    def get(self, request, pk):
        category = get_object_or_404(Category, pk=pk)
        articles = category.articles.all() # type: ignore
        serializer = ArticleSerializer(articles, many=True)
        return Response(serializer.data)
    
# Favorite an article
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, article_id):
    article = get_object_or_404(Article, pk=article_id)
    favorite, created = Favorite.objects.get_or_create(article=article, user=request.user)

    if not created:
        favorite.delete()
        return Response({"is_favorite": False})
    return Response({"is_favorite": True})


class UserArticlesView(APIView):
    permission_classes = [IsAuthenticated]


    def get(self, request):
        # Récupère uniquement les articles de l'utilisateur connecté
        user = request.user
        articles = Article.objects.filter(author=user).order_by('-created_at')
        serializer = ArticleSerializer(articles, many=True)
        return Response(serializer.data)

