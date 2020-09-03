const body = document.querySelector('body')
const table = document.createElement('table')
body.appendChild(table)

table.style.width = '50%'
table.setAttribute('align', 'center')

const headerRow = document.createElement('tr')
const tableHead = document.createElement('thead')

const headers = ['First Name', 'Last Name', 'About', 'Eye Color']

headers.forEach(header => {
    const element = document.createElement('th')
    const text = document.createTextNode(header)
    element.appendChild(text)
    headerRow.appendChild(element)
})
tableHead.appendChild(headerRow)
table.appendChild(tableHead)

const tableBody = document.createElement('tbody')

let persons
fetch('./data.json')
    .then(response => response.json())
    .then(
        data => {
            persons = data
            createTable(1)
            const pageNumber = Math.ceil(persons.length / 10)
            addButtons(pageNumber)
        })

const addButtons = amount => {
    const buttonHolder = document.createElement('div')
    buttonHolder.style.textAlign = 'center'
    for (let i = 0; i < amount; i++) {
        const button = document.createElement('input')
        button.type = 'button'
        button.value = (i + 1).toString()
        buttonHolder.appendChild(button)
        button.addEventListener('click', event => createTable(event.toElement.defaultValue))
    }
    body.appendChild(buttonHolder)
}

const createTable = (pageNumber) => {
    tableBody.textContent = ''
    persons.slice(10 * (pageNumber - 1), 10 * pageNumber).forEach(person => {
        const row = document.createElement('tr')

        Object.keys(person).forEach(key => {
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
                    element.style.display = '-webkit-box'
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
                    element.appendChild(textNode)
                    row.appendChild(element)
                    break
                }
            }
        })

        const edit = document.createElement('input')
        edit.type = 'button'
        edit.value = 'Edit'
        edit.addEventListener('click', event => editRow(event))

        row.appendChild(edit)
        tableBody.appendChild(row)
    })
    table.appendChild(tableBody)
}

const editRow = ({target}) => {
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

const acceptRow = ({target}) => {
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


const getSort = ({target}) => {
    const order = (target.dataset.order = (-parseInt(target.dataset.order) || -1).toString())
    const index = [...target.parentNode.cells].indexOf(target)
    const collator = new Intl.Collator()
    const comparator = (index, order) => (a, b) => order * collator.compare(
        a.children[index].innerHTML,
        b.children[index].innerHTML
    )

    for (const tBody of target.closest('table').tBodies)
        tBody.append(...[...tBody.rows].sort(comparator(index, order)))
}

tableHead.addEventListener('click', event => getSort(event))



