import MainPage from './pages/MainPage.vue';
import ElementPlus from 'element-plus';
import './styles/index.scss';
import { createApp } from 'vue';

var app= createApp(MainPage);
app.use(ElementPlus);
app.mount('#app');

