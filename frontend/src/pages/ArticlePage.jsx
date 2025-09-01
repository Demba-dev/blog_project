import React from 'react'
import { useParams } from 'react-router-dom'
import ArticleDetail from '../components/ArticleDetail';

function ArticlePage ({token}){

  const {id} = useParams();
  return <ArticleDetail articleId={id} token={token}/>;
}

export default ArticlePage
