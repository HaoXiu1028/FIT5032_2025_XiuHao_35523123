<template>
    <div class="news-card">
      <div class="news-date">{{ news.date }}</div>
      <div class="news-content">
        <h3>{{ news.title }}</h3>
        <p>{{ news.content }}</p>
        <a :href="news.link" class="btn btn-outline">Detalis</a>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NewsCard',
    props: {
      news: {
        type: Object,
        required: true
      }
    }
  }
  </script>
  
  <style scoped>
  .news-card {
    background: var(--white);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    padding: 20px;
    margin-bottom: 15px;
    display: flex;
    align-items: flex-start;
  }
  
  .news-content {
    flex: 1;
  }
  
  .news-date {
    background-color: var(--primary-color);
    color: var(--white);
    padding: 5px 15px;
    border-radius: 30px;
    font-size: 0.85rem;
    margin-right: 20px;
    min-width: 100px;
    text-align: center;
  }
  
  .news-card h3 {
    margin-bottom: 10px;
    font-size: 1.1rem;
  }
  
  .news-card p {
    color: var(--dark-gray);
    font-size: 0.95rem;
  }
  </style>