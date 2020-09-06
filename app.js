const body = document.querySelector('body')
const table = document.createElement('table') // Создаем таблицу и добавляем ее в body
body.appendChild(table)

table.style.width = '50%' // Выравниваем по центру и задаем ширину в 50%
table.setAttribute('align', 'center')

const headerRow = document.createElement('tr')
const tableHead = document.createElement('thead') // thead и tbody нужны для сортировки колонок

const headers = ['First Name', 'Last Name', 'About', 'Eye Color']

headers.forEach(header => { // Пробегаем по массиву заголовков
    const element = document.createElement('th')
    const text = document.createTextNode(header)
    element.appendChild(text)  // Добавляем в заголовок текст

    const button = document.createElement('input') // Создаем в заголовке кнопку для скрытия колонки
    button.type = 'button'
    button.value = 'Hide'

    button.addEventListener('click', event => hideColumn(event)) // EventListener для клика на кнопку скрытия
    element.appendChild(button)

    headerRow.appendChild(element)
})
tableHead.appendChild(headerRow)
table.appendChild(tableHead)

const hideColumn = ({target}) => { // Функция скрытия колонок
    target.parentNode.classList.add('hidden') // Добавляем заголовку класс hidden, чтобы не выводить содержимое столбца при переключении страницы
    target.parentNode.querySelector('input').value = 'Show' // Меняем кнопку Hide на Show, также изменяя eventListener
    target.parentNode.querySelector('input').removeEventListener('click', hideColumn)
    target.parentNode.querySelector('input').addEventListener('click', event => showColumn(event))
    const index = [...target.parentNode.parentNode.cells].indexOf(target.parentNode) // Получаем индекс колонки
    target.parentNode.dataset.index = index.toString()

    for (const tBody of target.closest('table').tBodies) { // Удаляем контент у всех td колонки
        for (const row of tBody.rows) {
            row.childNodes[index].textContent = ''
        }
    }
}

const showColumn = ({target}) => { // Функция показа колонки
    target.parentNode.classList.remove('hidden') // Удаляем класс hidden и заменяем eventListener
    target.parentNode.querySelector('input').removeEventListener('click', showColumn)
    target.parentNode.querySelector('input').addEventListener('click', event => hideColumn(event))

    createTable(table.dataset.page) // Вызываем метод создания таблицы, который отображает все колонки кроме колонок с классом hidden у хэдера
}

const tableBody = document.createElement('tbody')

let persons
fetch('./data.json') // Получаем данные из json и присваиваем массиву person
    .then(response => response.json())
    .then(
        data => {
            persons = data
            createTable(1) // Создаем таблицу с первыми 10 элементами массива
            const pageNumber = Math.ceil(persons.length / 10) // Считаем количество страниц
            addButtons(pageNumber) // Создаем и добавляем на страницу кнопки
        })

const addButtons = amount => {
    const buttonHolder = document.createElement('div') // Используем div чтобы отображать кнопки по середине, прямо под таблицей
    buttonHolder.style.textAlign = 'center'
    for (let i = 0; i < amount; i++) {
        const button = document.createElement('input')
        button.type = 'button'
        button.value = (i + 1).toString()
        buttonHolder.appendChild(button)
        button.addEventListener('click', event => createTable(event.toElement.defaultValue)) // Добавляем eventListener, который при клике на кнопку отображает нужную страницу
    }
    body.appendChild(buttonHolder)
}

const createTable = (pageNumber) => { // Создание нужное страницы таблицы
    table.dataset.page = pageNumber
    tableBody.textContent = '' // Удаляем все что было в tbody до этого
    persons.slice(10 * (pageNumber - 1), 10 * pageNumber).forEach(person => { // Пробегаем по подмассиву всех данных, чтобы получить только данные нужной страницы
        const row = document.createElement('tr')

        Object.keys(person).forEach(key => { // Для каждого объекта подмассива ищем интересующие нас ключи и добавляем в таблицу
            switch (key) {
                case 'name': {
                    const element = document.createElement('td')
                    const textNode = document.createTextNode(person[key].firstName)
                    element.appendChild(textNode)
                    row.appendChild(element)
                    const element2 = document.createElement('td')
                    const textNode2 = document.createTextNode(person[key].lastName)
                    element2.appendChild(textNode2)
                    row.appendChild(element2)
                    break
                }
                case 'about': {
                    const element = document.createElement('td')
                    const textNode = document.createTextNode(person[key])
                    element.style.display = '-webkit-box' // Используем webkit-box для отображения about в две строки
                    element.style.webkitLineClamp = '2'
                    element.style.webkitBoxOrient = 'vertical'
                    element.style.overflow = 'hidden'
                    element.style.textOverflow = 'ellipsis'
                    element.appendChild(textNode)
                    row.appendChild(element)
                    break
                }
                case 'eyeColor': {
                    const element = document.createElement('td')
                    const textNode = document.createTextNode(person[key])
                    element.style.background = person[key] // Цвет фона совпадает с цветом текста, что создает видимость отсутсвия надписи и не ломает сортировку колонки
                    element.style.color = person[key]
                    element.appendChild(textNode)
                    row.appendChild(element)
                    break
                }
            }
        })

        const edit = document.createElement('input') // Добавляем кнопку в каждую строку, позволяющую редактировать соответсвюущую строку
        edit.type = 'button'
        edit.value = 'Edit'
        edit.addEventListener('click', event => editRow(event))

        row.appendChild(edit)
        tableBody.appendChild(row)
    })
    table.appendChild(tableBody)

    for (const header of tableBody.parentNode.querySelectorAll('th')) { // Удаляем текст из колонок th которых имеет класс hidden
        if (header.classList.contains('hidden')) {
            for (const row of tableBody.childNodes) {
                row.childNodes[header.dataset.index].textContent = ''
            }
        }
    }
}

const editRow = ({target}) => { // Функция делающая контент в строке редактируемым и меняющая кнопку Edit на Ok
    target.closest('tr').querySelectorAll('td').forEach(item =>
        item.setAttribute('contenteditable', 'true'))
    const row = target.parentNode
    row.removeChild(target)

    const ok = document.createElement('input')
    ok.type = 'button'
    ok.value = 'Ok'
    ok.addEventListener('click', event => acceptRow(event))
    row.appendChild(ok)
}

const acceptRow = ({target}) => { // Функция делающая контент в строке не редактируемым и меняющая кнопку Ok на Edit
    target.closest('tr').querySelectorAll('td').forEach(item =>
        item.setAttribute('contenteditable', 'false'))
    const row = target.parentNode
    row.removeChild(target)

    const edit = document.createElement('input')
    edit.type = 'button'
    edit.value = 'Edit'
    edit.addEventListener('click', event => editRow(event))
    row.appendChild(edit)
}


const getSort = ({target}) => { // Функция сортирующая строки после клика на соответсвующей header колонки
    const order = (target.dataset.order = (-parseInt(target.dataset.order) || -1).toString()) // Порядок сортировка 1 - в алфавитном/ -1 - в обратном
    const index = [...target.parentNode.cells].indexOf(target) // Индекс колонки, на которую кликнули
    const collator = new Intl.Collator() // Сортировщик объектов
    const comparator = (index, order) => (a, b) => order * collator.compare( // Сравниваем данные в td с индексом кликнутой колонки
        a.children[index].innerHTML,
        b.children[index].innerHTML
    )

    for (const tBody of target.closest('table').tBodies) // Получаем массив tbody из таблицы
        tBody.append(...[...tBody.rows].sort(comparator(index, order))) // Для каждого tbody сортируем строки внутри него согласно ранее описаному компаратору
}

tableHead.addEventListener('click', event => getSort(event)) // Добавляем thead сортируемость строк по клику на колонку



