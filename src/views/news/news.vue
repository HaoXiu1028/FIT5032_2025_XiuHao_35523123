<template>
    <div class="news-section">
      <div class="section-title">
        <i class="fas fa-newspaper"></i>
        <h2>News</h2>
      </div>
      <NewsCard v-for="(news, index) in newsList" :key="index" :news="news" />
    </div>
  </template>
  
  <script>
  import NewsCard from './NewsCard.vue'
  
  export default {
    name: 'NewsSection',
    components: {
      NewsCard
    },
    data() {
      return {
        newsList: [
          {
            date: '2025年7月15日',
            title: 'Major updates to immigration health policies',
            content: 'The latest health policy simplifies the immigration medical registration process and expands health insurance coverage. Please check as soon as possible to see if you are eligible for the new policy.',
            link: '#'
          },
          {
            date: '2025年7月10日',
            title: 'Fall flu vaccination program begins',
            content: 'Free flu vaccinations are now available in this area. Please check your local vaccination site to protect the health of you and your family',
            link: '#'
          }
        ]
      }
    }
  }
  </script>
  
  <style scoped>
  .news-section {
    margin-bottom: 40px;
  }
  </style>