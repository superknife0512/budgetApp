var nextBtn = document.querySelector('#next');
var prevBtn = document.querySelector('#prev');
var cardList = document.querySelectorAll('.category__card');

nextBtn.addEventListener('click', () => {
    cardList.forEach(card => {
        card.classList.add('category__forward')
    })
})
prevBtn.addEventListener('click', () => {
    cardList.forEach(card => {
        card.classList.remove('category__forward')
    })
})