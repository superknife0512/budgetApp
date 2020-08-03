class Category {
    category = '';
    type = '';
    history = []; // {title, desc, amount}
    constructor(title, category, desc, type, amount) {
        this.category = category;
        this.type = type;
        this.history.push({
            title,
            desc,
            amount,
            createdDate: new Date().toDateString()
        })
    }
    get totalAmount() {
        if (this.history.length === 1) {
            return this.history[0].amount
        }
        return this.history.reduce((a, b) => {
            return +a.amount + +b.amount
        })
    }
    get createdDate() {
        return new Date().toDateString()
    }
}

class State {
    static budgetInputState = {
        name: 'BUDGET_INPUT',
        current: {category: ''},
    }
    static categoryBudgetState = {
        name: 'CATEGORY_BUDGET',
        current: [],
    }
    static cardDetailState = {
        name: 'CARD_DETAIL',
        current: {},
    }

    static whatChange = [];

    static setBudgetInputState(data) {
        this.budgetInputState.current = {...data};   
        this.observer(this.budgetInputState)     
    }
    static setCardDetailState(data) {
        this.cardDetailState.current = data;   
        this.observer(this.cardDetailState)     
    }
    static setCategoryBudgetState(data) {
        this.categoryBudgetState.current = [...data];   
        this.observer(this.categoryBudgetState)     
    }

    static observer(object) {
        this.whatChange.push(object);
        DOMService.DOMRendering(this.whatChange);
        this.whatChange = []
    }
}

// DOM relation work
class DOMService {
    static gettingDOM() {
        return {
            budgetInput: document.getElementById('budget-input'),
            budgetInputCancelBtn: document.querySelector('#budget-input').querySelector('.btn-secondary'),
            titleInput: document.querySelector('#title'),
            descInput: document.querySelector('#desc'),
            amountInput: document.querySelector('#amount'),
            typeIncome: document.querySelector('#type-income'),
            budgetIncomeList: document.querySelector('.budget__income'),
            budgetCostList: document.querySelector('.budget__cost'),
            cardDetailDOM: document.querySelector('#card-detail'),
            cardList: document.querySelector('.card__list'),
            summaryDOM: document.querySelector('.summary'),
        }
    }
    static DOMRendering(eventList = []) {
        if (eventList.length > 0) {
            eventList.forEach(event => {
                switch (event.name) {
                    case 'BUDGET_INPUT':
                        this.budgetInputDOMRender(event)
                        break;
                    case 'CATEGORY_BUDGET':
                        this.budgetCategoryDOMRender(event);
                        break;
                    case 'CARD_DETAIL':
                        this.cardDetailRender(event);
                        break;
                }
            })     
            this.renderSummaryDOM()       
        }
    }

    static renderSummaryDOM() {
        const categoryState = State.categoryBudgetState.current;
        let finalAmount = 0;
        categoryState.forEach(category => {
            if (category.type === 'income') {
                finalAmount += category.totalAmount
            } else {
                finalAmount -= category.totalAmount
            }
        })
        this.gettingDOM().summaryDOM.querySelector('p').innerHTML = `$${+finalAmount.toFixed(0)}`
    }

    static cardDetailRender(state) {
        console.log(state.current);
        const cardDetailDOM = this.gettingDOM().cardDetailDOM
        if (_.isEmpty(state.current)) {
            return cardDetailDOM.classList.add('isDisplay')
        }
        cardDetailDOM.classList.remove('isDisplay');
        function removeAndAddClass(removedClass, addedClass, query) {
            cardDetailDOM.querySelector(query).classList.remove(removedClass)
            cardDetailDOM.querySelector(query).classList.add(addedClass)
        }
        if (state.current.type === 'income') {
            removeAndAddClass('card--cost', 'card--income', '.card')
            removeAndAddClass('cost', 'income', 'h5')
        } else {
            removeAndAddClass('card--income', 'card--cost', '.card')
            removeAndAddClass('income', 'cost', 'h5')
        }
        cardDetailDOM.querySelector('.card__amount').querySelector('h5').innerText = `$${state.current.totalAmount}`
        cardDetailDOM.querySelector('.card__info').querySelector('h4').innerText = `${state.current.category} ${state.current.type}`
        // Redendering the list
        document.querySelectorAll('.card__history').forEach(ele => {
            ele.parentNode.removeChild(ele);
        })
        state.current.history.forEach(ele => {
            this.gettingDOM().cardList.insertAdjacentHTML('afterend',
                `
                <div class="card__history">
                    <img src="./images/calendar.png" alt="calendar">
                    <div class="card__history-content">
                        <h5>${ele.title}: <span style="color: rgb(245, 4, 145)"> $${ele.amount} </span></h5>
                        <p>${ele.desc}</p>
                        <i>Create at: ${ele.createdDate}</i>
                    </div>
                </div>
                `
            )
        })
    }
    
    static budgetInputDOMRender(state) {
        if (_.isEmpty(state.current)) {
            return this.gettingDOM().budgetInput.classList.add('isDisplay')
        }
        this.gettingDOM().budgetInput.classList.remove('isDisplay')
        this.gettingDOM().budgetInput.querySelector('h4').innerHTML = `Create new: ${state.current.category}`;
    }
    static budgetCategoryDOMRender(state) {
        const incomeDOMList = this.gettingDOM().budgetIncomeList;
        const costDOMList = this.gettingDOM().budgetCostList;
        const listOfCategory = [...state.current];
        
        const categoryIncome = listOfCategory.filter(ele => ele.type === 'income');
        const categoryCost = listOfCategory.filter(ele => ele.type === 'cost');
        
        function listRendering(domList, data) {
            domList.querySelectorAll('.budget__card').forEach(ele => {
                ele.parentNode.removeChild(ele)
            })
            data.forEach(ele => {
                domList.insertAdjacentHTML(
                    'beforeend',
                    `
                    <div class="budget__card" onclick="Main.openCardHandler('${ele.type}', '${ele.category}')">
                        <img class="border-${ele.type}" src="./images/${ele.category}.png" alt="img">
                        <div class="budget__card-content">
                            <h4>${ele.category} income</h4>
                            <h5> ${ ele.type === 'income' ? `$${ele.totalAmount}` :`-$${ele.totalAmount}`} </h5>
                            <p>Created at: ${ele.createdDate} </p>
                        </div>
                    </div>
                    `
                )
            })
        }
        listRendering(incomeDOMList, categoryIncome);
        listRendering(costDOMList, categoryCost);
        
    }
}

// run app and dom setting
class Main {
    static settingEvent() {   
        const allCategories = document.querySelectorAll('.category__card');
        allCategories.forEach(ele => {
            ele.addEventListener('click', () => {
                State.setBudgetInputState({category: ele.dataset.type})
            })
        })
        const allDOMs = DOMService.gettingDOM();
        allDOMs.budgetInputCancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            State.setBudgetInputState({});
        })        
        document.querySelector('.popup__form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCategoryHandler()
        })
    }

    static addCategoryHandler() {
        const budgetInputStateClone = {...State.budgetInputState.current};
        const categoryStateClone = [...State.categoryBudgetState.current];
        const {titleInput, amountInput, descInput, typeIncome} = DOMService.gettingDOM();
        const typeCheck = typeIncome.checked ? 'income' : 'cost';

        const category = new Category(
            titleInput.value,
            budgetInputStateClone.category,
            descInput.value,
            typeCheck,
            +amountInput.value
        )

        const existingCategory = categoryStateClone.find(ele => {
            return ele.type === typeCheck && ele.category === category.category
        })
        if (!existingCategory) {
            categoryStateClone.push(category)
        } else {
            const newCategoryHistory = [...existingCategory.history];
            newCategoryHistory.push({
                title: titleInput.value,
                desc: descInput.value,
                amount: +amountInput.value,
                createdDate: new Date().toDateString()
            })
            existingCategory.history = newCategoryHistory;
        }
        State.setCategoryBudgetState(categoryStateClone)                
        State.setBudgetInputState({})
    }

    static openCardHandler(type, category) {
        const categoryState = [...State.categoryBudgetState.current];
        const detailedCategory = categoryState.find(ele => {
            return ele.type === type && ele.category === category
        })
        State.setCardDetailState(detailedCategory)
    }
    static cardDetailClose() {
        State.setCardDetailState({})
    }
    
    static run() {
        this.settingEvent();
    }
}

Main.run();