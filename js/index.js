const REST_API_KEY = "0e132c073f9bc9a027612e4f19f52205";

function openSearchWindow() {
    const query = document.getElementById("search_word").value.trim();

    // 1. 검색어가 비어있을 때 알림 처리 
    if (!query) {
        alert("검색어를 입력하세요.");
        return;
    }

    // 2. 검색 내용을 쿼리 스트링(?q=...)에 담아 새 창으로 엽니다. 
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
}

window.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById("search_word");

    // 1. 현재 주소창에 ?q= 가 붙어있는지 확인 (확실한 검색 페이지 판별)
    const urlParams = new URLSearchParams(window.location.search);
    const queryFromUrl = urlParams.get('q');

    if (queryFromUrl && window.location.pathname.includes('search.html')) {
        if (searchInput) {
            searchInput.value = queryFromUrl;
            toggleClearButton();
        }
        searchBooks(queryFromUrl);
    }

    // 2. 검색 페이지가 아닌 경우 (메인 페이지 등)
    const menuItems = document.querySelectorAll('.main_body li');
    const recommendTitle = document.getElementById('recommendTitle');

    if (menuItems.length > 0) {

        loadIndexBooks('소설');

        menuItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                document.querySelector('.main_body .li-thumb-active')?.classList.remove('li-thumb-active');
                item.classList.add('li-thumb-active');

                const categoryName = item.textContent.trim();
                if (categoryName === '편집장의 선택') {
                    loadIndexBooks('소설');
                } else {
                    loadIndexBooks(categoryName);
                }
            });
        });
    }
});


/**
 * 카카오 API를 호출하여 도서를 화면에 그려주는 핵심 함수
 * 매개변수(queryFromUrl)가 있으면 넘겨받은 값으로, 없으면 input 창의 값으로 검색합니다.
 */
async function searchBooks(queryFromUrl) {
    let query = queryFromUrl || document.getElementById("search_word").value.trim();
    const bookList = document.getElementById("bookList");

    if (!bookList) {
        console.error("화면에 id='bookList'를 가진 결과창 단락이 존재하지 않습니다.");
        return;
    }

    // 검색어가 없을 때의 안전장치
    if (!query) {
        bookList.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #000000; font-weight: bold;">검색어를 입력하세요.</p>`;
        return;
    }

    bookList.innerHTML = `<p style="grid-column: 1/-1; text-align: center;"> 도서를 검색 중입니다 ...</p>`;

    try {
        const response = await fetch(`https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=9`, {
            method: 'GET',
            headers: {
                'Authorization': `KakaoAK ${REST_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error('네트워크 응답에 문제가 발생했어요.');
        }

        const data = await response.json();
        const books = data.documents;

        const filteredBooks = books.filter(book =>
            book.title.toLowerCase().includes(query.toLowerCase())
        );

        if (books.length === 0) {
            bookList.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">검색 결과가 없어요.</p>';
            return;
        }

        bookList.innerHTML = '';

        books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';

            const thumbnailSrc = book.thumbnail ? book.thumbnail : 'https://placehold.co/170x250?text=No+Image';
            const authorsName = book.authors.length > 0 ? book.authors.join(', ') : '저자 미상';
            const formattedPrice = book.sale_price > 0 ? `${book.sale_price.toLocaleString()}원` : '판매중지/가격미정';

            card.innerHTML = `
                <img class="book-thumbnail" src="${thumbnailSrc}" alt="${book.title} 표지">
                <div class="book-title" title="${book.title}">${book.title}</div>
                <div class="book-authors">${authorsName}</div>  
                <div class="book-price">${formattedPrice}</div>
            `;

            // 책 카드를 클릭하면 상세 보기 새 창 열기 
            card.style.cursor = 'pointer';
            card.onclick = () => {
                if (book.url) window.open(book.url, '_blank');
            };

            bookList.appendChild(card);
        });

    } catch (error) {
        console.log('에러 상세 : ', error);
        bookList.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">데이터 로딩 중 에러 발생</p>';
    }
}

async function loadIndexBooks(categoryName) {
    const indexBookList = document.getElementById("indexBookList") || document.getElementById("bookList");

    if (!indexBookList) {
        console.error("추천 도서를 출력할 HTML 요소가 존재하지 않습니다.");
        return;
    }

    indexBookList.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">추천 도서를 불러오는 중입니다...</p>`;

    try {
        const response = await fetch(`https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(categoryName)}&size=4`, {
            method: 'GET',
            headers: {
                'Authorization': `KakaoAK ${REST_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error('네트워크 응답에 문제가 발생했어요.');
        }

        const data = await response.json();
        const books = data.documents;

        if (books.length === 0) {
            indexBookList.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">추천 도서 결과가 없습니다.</p>';
            return;
        }

        indexBookList.innerHTML = '';

        books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-card';

            const thumbnailSrc = book.thumbnail ? book.thumbnail : 'https://placehold.co/170x250?text=No+Image';
            const authorsName = book.authors.length > 0 ? book.authors.join(', ') : '저자 미상';
            const formattedPrice = book.sale_price > 0 ? `${book.sale_price.toLocaleString()}원` : '판매중지/가격미정';

            card.innerHTML = `
                <img class="book-thumbnail" src="${thumbnailSrc}" alt="${book.title} 표지">
                <div class="book-title" title="${book.title}">${book.title}</div>
                <div class="book-authors">${authorsName}</div>  
                <div class="book-price">${formattedPrice}</div>
            `;

            card.style.cursor = 'pointer';
            card.onclick = () => {
                if (book.url) window.open(book.url, '_blank');
            };

            indexBookList.appendChild(card);
        });

    } catch (error) {
        console.error('추천 도서 로딩 에러 : ', error);
        indexBookList.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">추천 도서를 불러오는 중 에러가 발생했습니다.</p>';
    }
}


function toggleClearButton() {
    const searchInput = document.getElementById('search_word');
    const clearBtn = document.getElementById('search-clear-btn');

    if (searchInput.value.trim().length > 0) {
        clearBtn.style.display = 'inline-block';
    } else {
        clearBtn.style.display = 'none';
    }
}

function clearInput() {
    const searchInput = document.getElementById('search_word');
    const clearBtn = document.getElementById('search-clear-btn');

    searchInput.value = '';
    clearBtn.style.display = 'none';
    searchInput.focus();
}

// 스와이퍼
const menuSwiper = new Swiper('.swiper_bn', {
    slidesPerView: 'auto',
    spaceBetween: 10,
    slideToClickedSlide: true,
    watchSlidesProgress: true,
    on: {
        init: function () {
            const slides = this.slides;
            slides.forEach((slide, index) => {
                slide.addEventListener('mouseenter', () => {
                    topSwiper.slideTo(index);
                });
            });
        }
    }
});

// 2. 상단 스와이퍼 (콘텐츠 메인) 초기화
const topSwiper = new Swiper('.swiper_top', {
    slidesPerView: 1,
    spaceBetween: 0,
    autoplay: {
        delay: 4000, // 3초마다 자동으로 다음 슬라이드로 이동 (원하는 시간으로 조절 가능)
        disableOnInteraction: false, // 클릭/조작해도 자동 재생이 완전히 꺼지지 않도록 설정
    },
    thumbs: {
        swiper: menuSwiper,
    },
});
const mainContent = document.querySelector('.main-content');
const toggleBtn = document.getElementById('btn-swiper-toggle');
let isPausedByBtn = false;

mainContent.addEventListener('mouseenter', () => {
    topSwiper.autoplay.stop(); // 마우스 올리면 자동 재생 일시정지
});

mainContent.addEventListener('mouseleave', () => {
    if (!isPausedByBtn) {
        topSwiper.autoplay.start();
    }
});
toggleBtn.addEventListener('click', () => {
    if (topSwiper.autoplay.running) {
        topSwiper.autoplay.stop();
        isPausedByBtn = true;
        toggleBtn.textContent = '▶';
    } else {
        topSwiper.autoplay.start();
        isPausedByBtn = false;
        toggleBtn.textContent = '⏸';
    }
});

// main 강조효과
window.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.main_body li');
    menuItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const currentActive = document.querySelector('.main_body .li-thumb-active');
            if (currentActive) {
                currentActive.classList.remove('li-thumb-active');
            }
            item.classList.add('li-thumb-active');
        });
    });
});
