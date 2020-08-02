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
            amount
        })
    }

    totalAmount() {
        return this.history.reduce((a, b) => {
            return a.amount + b.amount
        })
    }

    createdDate() {
        return new Date().toDateString()
    }
}

class State {
    static budgetInputState = {
        name: 'BUDGET_INPUT',
        current: {type: ''},
        prev: {}
    }
    static categoryBudgetState = {
        name: 'CATEGORY_BUDGET',
        current: [],
        prev: [],
    }

    static whatChange = [];

    static setBudgetInputState(data) {
        this.budgetInputState.prev = this.budgetInputState.current
        this.budgetInputState.current = {...data};   
        this.observer(this.budgetInputState)     
    }
    static setCategoryBudgetState(data) {
        this.categoryBudgetState.prev = this.categoryBudgetState.current
        this.categoryBudgetState.current = [...data];   
        this.observer(this.categoryBudgetState)     
    }

    static observer(object) {
        if (_.isEqual(object.prev, object.current)) {
        } else {
            this.whatChange.push(object);
            DOMService.DOMRendering(this.whatChange);
            this.whatChange = []
        }
        
    }
}

// DOM relation work
class DOMService {
    static gettingDOM() {
        const budgetInput = document.getElementById('budget-input');
        const budgetInputCancelBtn = document.querySelector('#budget-input').querySelector('.btn-secondary');
        return {
            budgetInput,
            budgetInputCancelBtn,
            titleInput: document.querySelector('#title'),
            descInput: document.querySelector('#desc'),
            amountInput: document.querySelector('#amount'),
            typeIncome: document.querySelector('#type-income'),
        }
    }
    static DOMRendering(eventList = []) {
        if (eventList.length > 0) {
            eventList.forEach(event => {
                switch (event.name) {
                    case 'BUDGET_INPUT':
                        this.budgetInputDOMRender(event)
                        break;
                }
            })            
        }
    }
    static async budgetInputDOMRender(state) {
        if (_.isEmpty(state.current)) {
            return this.gettingDOM().budgetInput.classList.add('isDisplay')
        }
        this.gettingDOM().budgetInput.classList.remove('isDisplay')
        this.gettingDOM().budgetInput.querySelector('h4').innerHTML = `Create new: ${state.current.category}`;
    }
}

// run app and dom setting
class Main {
    static settingEvent() {   
        const allCategories = document.querySelectorAll('.category__card');
        allCategories.forEach(ele => {
            ele.addEventListener('click', () => {
                State.setBudgetInputState({type: '', category: ele.dataset.type})
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
            State.setCategoryBudgetState(categoryStateClone)
        } else {
            existingCategory.history.push({
                title: titleInput.value,
                desc: descInput.value,
                amount: amountInput.value
            })
            State.setCategoryBudgetState(categoryStateClone)                
        }            
        State.setBudgetInputState({})
    }
    
    static run() {
        this.settingEvent();
    }
}

Main.run();