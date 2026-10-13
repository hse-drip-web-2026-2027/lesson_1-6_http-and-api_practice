const API_URL = "http://localhost:3000/applications"

const applicationList = document.querySelector("#application-list")
const emptyState = document.querySelector("#empty-state")
const requestStatus = document.querySelector("#request-status")
const reloadButton = document.querySelector("#reload-button")

const applicationForm = document.querySelector("#application-form")
const submitButton = document.querySelector("#submit-button")
const submitStatus = document.querySelector("#submit-status")

// Готовая вспомогательная функция переключает состояния списка.
// Во время практики вызывайте ее с одним из значений:
// loading, success, empty или error.
function setListState(state, message) {
  requestStatus.dataset.state = state
  requestStatus.textContent = message

  const hasApplications = state === "success"
  const hasEmptyResult = state === "empty"

  applicationList.hidden = !hasApplications
  emptyState.hidden = !hasEmptyResult
}

// Карточка уже подготовлена, чтобы практика не превратилась в верстку.
// Обратите внимание: значения API попадают в DOM через textContent.
function createApplicationCard(application) {
  const card = document.createElement("article")
  card.className = "application-card"

  const heading = document.createElement("div")
  heading.className = "application-card__heading"

  const name = document.createElement("h3")
  name.textContent = application.name

  const id = document.createElement("span")
  id.className = "application-card__id"
  id.textContent = `#${application.id}`

  const topic = document.createElement("p")
  topic.className = "application-card__topic"
  topic.textContent = application.topic

  const email = document.createElement("a")
  email.className = "application-card__email"
  email.href = `mailto:${application.email}`
  email.textContent = application.email

  heading.append(name, id)
  card.append(heading, topic, email)

  return card
}

function renderApplications(applications) {
  // TODO 3.1: очистите предыдущие карточки через replaceChildren().
  applicationList.replaceChildren()

  // TODO 3.2: если массив пуст, включите состояние empty и завершите функцию.
  if(applications.length === 0){
    setListState("empty", "API вернул пустой массив");
    return 
  }
  // TODO 3.3: для каждой заявки создайте карточку и добавьте ее в список.
  applications.forEach((application) => {
    const card = createApplicationCard(application) 
    applicationList.append(card)
  })
  // TODO 3.4: включите состояние success и покажите количество заявок.
   setListState("success", `Загружено заявок: ${applications.length}`)
}

async function loadApplications() {
  setListState("loading", "Загружаем заявки…")
  reloadButton.disabled = true

  try {
    // TODO 2.1: выполните GET-запрос к API_URL и сохраните Response.
    const response = await fetch(API_URL)

    // TODO 4.1: если response.ok равен false, выбросьте Error со статусом.
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    // TODO 2.2: получите массив через await response.json().
    const applications = await response.json()

    // TODO 2.3: выведите Response и полученные данные в Console.
    console.log("Response:", response)
    console.log("Applications:", applications)

    // TODO 3.5: передайте массив в renderApplications().
   renderApplications(applications)

    // TODO 4.2: включите состояние error и покажите понятное сообщение.
  } catch (error) {
  console.error("Техническая ошибка:", error)
  setListState("error", "Не удалось загрузить заявки. Проверьте API и повторите запрос.")

}

  finally {
    reloadButton.disabled = false
  }
}

applicationForm.addEventListener("submit", async (event) => {
  event.preventDefault()

  submitButton.disabled = true
  submitStatus.textContent = "Отправляем заявку…"

  // TODO 5.1: создайте FormData и объект application с name, email,
  // topic и createdAt. Значения получите методом formData.get().
  const formData = new FormData(applicationForm)

  const application = {
  name: formData.get("name"),
  email: formData.get("email"),
  topic: formData.get("topic"),
  createdAt: new Date().toISOString(),
}

  try {
    // TODO 5.2: выполните POST-запрос к API_URL.
    // Передайте method, заголовок Content-Type и JSON-строку в body.
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(application),
    })

    // TODO 5.3: проверьте response.ok. При ошибке выбросьте Error.
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }

    // TODO 5.4: получите созданный объект через response.json()
    // и выведите его в Console.
    const createdApplication = await response.json()
    console.log("Создана заявка:", createdApplication)

    // TODO 5.5: очистите форму, покажите успех и снова загрузите список.
  applicationForm.reset()
  submitStatus.textContent = "Заявка отправлена!"
  await loadApplications()
} catch (error) {
  console.error("Не удалось отправить заявку", error)
  submitStatus.textContent = "Не удалось отправить заявку. Проверьте API и Network."
} finally {
  submitButton.disabled = false
  }
})

reloadButton.addEventListener("click", loadApplications)

// Первый запрос выполняется сразу после загрузки страницы.
loadApplications()

