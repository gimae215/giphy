import config from "../config/apikey.js";

const API_KEY = config.apikey;
const NUM_GIFS = 10;

async function fetchGifs(query) {
    const giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${encodeURIComponent(query)}&limit=${NUM_GIFS}`;

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
                    if (data.data && data.data.length > 0) {
                        gifList = data.data.map(gif => gif.images.original.url);
                        success = true;
                    } else {
                        console.error('Unexpected data format:', data);
                        success = true; // 오류가 발생해도 다음 GIF 요청을 계속하도록 설정
                    }
                }
            } catch (error) {
                console.error('Error fetching GIFs:', error);
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

function displayGifs(gifList) {
    const list = document.querySelector('#giphy_list');
    const lines = document.querySelectorAll('#giphy_list .line');
    lines.forEach((el)=>{
      el.innerHTML = '';  // 기존의 콘텐츠를 삭제
    })
  

    gifList.forEach(gifUrl => {
        const img = document.createElement('img');
        img.src = gifUrl;
        list.appendChild(img); // list 요소에 img 요소를 추가
    });

    // 이미지를 다시 선택하여 이동
    const images = document.querySelectorAll('#giphy_list img');
    images.forEach((el, index) => {
        let num = (index + 1) % 3;
        document.querySelector('#line' + (num === 0 ? 3 : num)).appendChild(el);
    });
}

document.querySelector('#search_button').addEventListener('click', async () => {
    const query = document.querySelector('#search_input').value.trim();
    if (query) {
        try {
            const gifList = await fetchGifs(query);
            displayGifs(gifList);
        } catch (error) {
            console.error('Failed to fetch GIFs:', error);
        }
    } else {
        alert('Please enter a search term.');
    }
});