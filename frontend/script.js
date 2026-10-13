const API_URL = "http://localhost:3000/applications"

const applicationList = document.querySelector("#application-list")
const emptyState = document.querySelector("#empty-state")
const requestStatus = document.querySelector("#request-status")
const reloadButton = document.querySelector("#reload-button")
const topicFilter = document.querySelector("#topic-filter")

const applicationForm = document.querySelector("#application-form")
const submitButton = document.querySelector("#submit-button")
const submitStatus = document.querySelector("#submit-status")
const formTitle = document.querySelector("#form-title")
const methodBadge = document.querySelector("#method-badge")
const cancelEditButton = document.querySelector("#cancel-edit-button")

let editingApplicationId = null

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

function showRequestError(message) {
    requestStatus.dataset.state = "error"
    requestStatus.textContent = message
}

async function deleteApplication(application) {
    try {
        const response = await fetch(`${API_URL}/${application.id}`, {
            method: "DELETE",
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        await loadApplications()
    } catch (error) {
        console.error("Не удалось удалить заявку", error)
        showRequestError("Не удалось удалить заявку. Проверьте API и повторите запрос.")
    }
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

    const actions = document.createElement("div")
    actions.className = "application-card__actions"

    const deleteButton = document.createElement("button")
    deleteButton.type = "button"
    deleteButton.className = "button button--secondary button--danger"
    deleteButton.textContent = "Удалить"
    deleteButton.addEventListener("click", () => deleteApplication(application))

    const editButton = document.createElement("button")
    editButton.type = "button"
    editButton.className = "button button--secondary"
    editButton.textContent = "Редактировать"
    editButton.addEventListener("click", () => {
        setEditMode(application)
        applicationForm.scrollIntoView({behavior: "smooth", block: "start"})
    })

    actions.append(editButton, deleteButton)
    heading.append(name, id)
    card.append(heading, topic, email, actions)

    return card
}

function renderApplications(applications) {
    // 3.1
    applicationList.replaceChildren()

    // 3.2
    if (applications.length === 0) {
        setListState("empty", "API вернул пустой массив")
        return
    }

    // 3.3
    applications.forEach((application) => {
        applicationList.append(createApplicationCard(application))
    })

    // 3.4
    setListState("success", `Получено заявок: ${applications.length}`)
}

function getApplicationsUrl() {
    const url = new URL(API_URL)

    if (topicFilter.value) {
        url.searchParams.set("topic", topicFilter.value)
    }

    return url
}

async function loadApplications() {
    setListState("loading", "Загружаем заявки…")
    reloadButton.disabled = true

    try {
        // 2.1
        const response = await fetch(getApplicationsUrl())
        console.log("Request URL:", response.url)

        // 4.1
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        // 2.2
        const applications = await response.json()

        // 2.3
        console.log("Response:", response)
        console.log("Applications:", applications)

        // 3.5
        renderApplications(applications)
    } catch (error) {
        console.error("Не удалось загрузить заявки", error)

        // 4.2
        setListState("error", "Не удалось загрузить заявки. Проверьте API и повторите запрос.")
    } finally {
        reloadButton.disabled = false
    }
}

function setEditMode(application) {
    editingApplicationId = application.id

    applicationForm.elements.name.value = application.name
    applicationForm.elements.email.value = application.email
    applicationForm.elements.topic.value = application.topic

    formTitle.textContent = `Редактировать заявку #${application.id}`
    methodBadge.textContent = "PATCH"
    submitButton.textContent = "Сохранить изменения"
    cancelEditButton.hidden = false

    submitStatus.textContent = `Редактируется заявка #${application.id}`
}

function resetEditMode() {
    editingApplicationId = null

    formTitle.textContent = "Создать заявку"
    methodBadge.textContent = "POST"
    submitButton.textContent = "Отправить в API"
    cancelEditButton.hidden = true
}

applicationForm.addEventListener("submit", async (event) => {
    event.preventDefault()

    submitButton.disabled = true
    submitStatus.textContent = "Отправляем заявку…"

    // 5.1
    const formData = new FormData(applicationForm)

    const application = {
        name: formData.get("name"),
        email: formData.get("email"),
        topic: formData.get("topic"),
        createdAt: new Date().toISOString(),
    }

    try {
        if (editingApplicationId !== null) {
            const response = await fetch(`${API_URL}/${editingApplicationId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: application.name,
                    email: application.email,
                    topic: application.topic,
                }),
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            const updatedApplication = await response.json()
            console.log("Обновлена заявка:", updatedApplication)

            applicationForm.reset()
            resetEditMode()
            submitStatus.textContent = `Заявка #${updatedApplication.id} обновлена`
            await loadApplications()
            return
        }

        // 5.2
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(application),
        })

        // 5.3
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
        }

        // 5.4
        const createdApplication = await response.json()
        console.log("Создана заявка:", createdApplication)

        // 5.5
        applicationForm.reset()
        submitStatus.textContent = `Заявка #${createdApplication.id} сохранена`
        await loadApplications()
    } catch (error) {
        console.error("Не удалось отправить заявку", error)
        submitStatus.textContent = "Не удалось отправить заявку. Проверьте API и Network."
    } finally {
        submitButton.disabled = false
    }
})

cancelEditButton.addEventListener("click", () => {
    applicationForm.reset()
    resetEditMode()
    submitStatus.textContent = "Редактирование отменено. Форма снова в режиме создания."
})

reloadButton.addEventListener("click", loadApplications)
topicFilter.addEventListener("change", loadApplications)

// Первый запрос выполняется сразу после загрузки страницы.
loadApplications()

