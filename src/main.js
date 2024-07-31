import config from "../config/apikey.js";

const API_KEY = config.apikey;
const NUM_GIFS = 10;
const giphyUrl = `https://api.giphy.com/v1/gifs/random?api_key=${API_KEY}`;

async function fetchRandomGifs() {
  let gifList = [];
  let retries = 5; // 최대 재시도 횟수 설정

  for (let i = 0; i < NUM_GIFS; i++) {
    let success = false;
    let attempt = 0;
    
    while (!success && attempt < retries) {
      try {
        const response = await fetch(giphyUrl);
        if (response.status === 429) {
          console.log('Rate limit exceeded, waiting for 1 minute...');
          await new Promise(resolve => setTimeout(resolve, 60000)); // 1분 대기
        } else {
          const data = await response.json();
          if (data.data && data.data.images && data.data.images.original && data.data.images.original.url) {
            gifList.push(data.data.images.original.url);
            success = true;
          } else {
            console.error('Unexpected data format:', data);
            success = true; // 오류가 발생해도 다음 GIF 요청을 계속하도록 설정
          }
        }
      } catch (error) {
        console.error('Error fetching GIF:', error);
        attempt++;
        if (attempt < retries) {
          console.log(`Retrying... (${attempt}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 후 재시도
        } else {
          console.error('Max retries reached. Skipping this GIF.');
          break;
        }
      }
    }
  }

  return gifList;
}

fetchRandomGifs().then(gifList => {
  console.log('Random GIF List:', gifList);
  const list = document.querySelector('#giphy_list');
  gifList.forEach(gifUrl => {
    const img = document.createElement('img');
    img.src = gifUrl;
    list.appendChild(img);
  });
}).catch(error => {
  console.error('Failed to fetch GIFs:', error);
});