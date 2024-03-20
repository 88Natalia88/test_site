window.addEventListener('DOMContentLoaded', () =>{
    getProducts();
    startCountdown();
})

const items = document.querySelectorAll('.proposal__item');
const modalItems = document.querySelector('.modal__popup-items');
const closeBtn = document.querySelector('.modal__popup-close');
const modal = document.querySelector('.modal');

//api
async function getProducts() {
    const response = await fetch('https://t-pay.iqfit.app/subscribe/list-test');
    const productsArray = await response.json();
    const popularProducts = productsArray.filter(item => item.isPopular === true);
    const discountProducts = productsArray.filter(item => item.isDiscount === true);
    
    const oldPrices = productsArray.filter(item => item.isDiscount === false && item.isPopular === false);
    const oldPrice = oldPrices.map(item => item.price);
    renderOffer(discountProducts, oldPrice);
    renderProducts(popularProducts, oldPrice);
}

//секундомер
let countdown = 40;
let timerInterval;
let minute = document.getElementById('minute');
let second = document.getElementById('second');

function startCountdown() {
    timerInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    countdown--;

    if (countdown < 0) {
        clearInterval(timerInterval);
        getNewPrice();
        displayModal();
        return;
    }

    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;

    minute.innerText = formatTime(minutes);
    second.innerText = formatTime(seconds);

    if (countdown <= 30) {
        minute.style.color = '#FD4D35';
        second.style.color = '#FD4D35';
        document.querySelector('.header__tods').style.color = '#FD4D35';
        minute.classList.add('blink');
        second.classList.add('blink');
    }
}

function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}
//вычисляем процент
function calculatePercentChange(oldPrice, newPrice) {
    const percentChange = ((oldPrice - newPrice) / oldPrice) * 100;
    const roundedPercentChange = Math.round(percentChange / 10) * 10;
    return roundedPercentChange;
}

//выводим информацию в модальное окно
function renderOffer(discountProducts, oldPrice) {
    discountProducts.forEach((item, index) => {
        const percentChange = calculatePercentChange(oldPrice[index], item.price);
        if(item){
            const itemInfo = document.createElement('div');
            itemInfo.className = 'modal__popup-item';
            itemInfo.innerHTML += `
                <div class='modal__item-header'>
                    <p class="modal__item-name">${item.name}</p>
                    <label class="modal__castom-radio">
                        <input type="radio" name="radio-button" class="modal__popup-radio">
                        <span class="modal__castom-icon"></span>
                    </label>
                </div>
                <p class="modal__item-oldPrice">${oldPrice[index]}&#8381;</p>
                <div class='modal__item-info'>
                    <p class='modal__item-price'>${item.price}&#8381;</p>
                    <div class="modal__item-sale">
                        <img src='icons/Star.svg' alt="star" class='modal__item-star'>
                        <p class='modal__item-percent ${index === discountProducts.length - 1 ? 'modal__item-percent_last' : ''}'>-${percentChange}%</p>
                    </div>
                </div>
            `;
            modalItems.append(itemInfo);

            const items = document.querySelectorAll('.modal__popup-item');
            
            items.forEach(item =>{
                const radioButton = item.querySelector('.modal__popup-radio');
                item.addEventListener('click', () =>{
                    radioButton.checked = true;
                    items.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.style.cssText = '';
                        }
                    });
                    item.style.cssText = 'border: 2px solid rgb(1, 185, 197); background: rgba(1, 185, 197, 0.05);';
                    
                });
            });
        }
        
    });
}

//появление модального окна
function displayModal() {
    modal.style.display = 'block';
    document.body.classList.add('locked');
}
//закрываем модальное окно
closeBtn.addEventListener('click', ()=>{
    modal.style.display = 'none';
    document.body.classList.remove('locked');
})

//выводим товар в html
function renderProducts(popularProducts, oldPrice) {
    const items = document.querySelectorAll('.proposal__item');

    items.forEach((item, index) => {
        const product = popularProducts[index];
        const percentChange = calculatePercentChange(oldPrice[index], product.price);

        if (product) {
            const itemInfo = `
                <div class="proposal__item-sale">
                    <img src='icons/Star.svg' alt="star" class='proposal__item-star'>
                    <p class='proposal__item-percent'>-${percentChange}%</p>
                </div>
                
                <p class="proposal__item-name">${product.name}</p>
                <p class='proposal__item-price'>${product.price}&#8381;</p>
                <s class='proposal__item-oldPrice'>${oldPrice[index]}&#8381;</s>
            `;
            item.innerHTML += itemInfo;
        }
    });
}
//стоимость по истечению времени

function getNewPrice(){
    const screenWidth = window.innerWidth;

    document.querySelectorAll('.proposal__item-sale').forEach(item => {
        item.style.display = 'none';
    });
    document.querySelectorAll('.proposal__item-price').forEach(item =>{
        item.style.display = 'none';
    });
    const arr = document.querySelectorAll('.proposal__item-oldPrice');
    arr.forEach((item, index) => {
        if(index === arr.length - 1){
            item.classList.add('proposal__item-oldPrice_last');
        } else {
            item.classList.add('proposal__item-oldPrice_new');
        }
    })
    if (screenWidth <= 768){
        document.querySelectorAll('.proposal__item-motivation').forEach(item =>{
            item.style.cssText = 'grid-row: 2/3; grid-colum: 1/2;';
        })
    }
}


//выделение тарифа
items.forEach(item =>{
    item.addEventListener('click', () =>{
        items.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.style.cssText = '';
            }
        });
        item.style.cssText = 'border: 2px solid rgb(1, 185, 197); background: rgba(1, 185, 197, 0.05);'
    })
})
