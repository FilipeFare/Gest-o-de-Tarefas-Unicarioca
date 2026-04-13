const BASE_URL = "http://127.0.0.1:8000";

const formReg = document.getElementById('formRegistro');
if (formReg) {
    formReg.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputUser = document.getElementById("user");
        const inputEmail = document.getElementById("email");
        const inputPassword = document.getElementById("password");
        const aviso = document.getElementById("mensagemAviso");
        try {
            const response = await fetch(`${BASE_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: inputUser.value, email: inputEmail.value, password: inputPassword.value })
            });
            const data = await response.json();
            if (response.ok) {
                aviso.textContent = "Usuário cadastrado com sucesso!";
                aviso.className = "sucesso";
                inputUser.value = ""; inputEmail.value = ""; inputPassword.value = "";
            } else {
                aviso.textContent = "Erro: " + (data.message || "Tente outro e-mail");
                aviso.className = "erro";
            }
        } catch (error) {
            aviso.textContent = "Erro de conexão.";
            aviso.className = "erro";
        }
    });
}

const formLog = document.getElementById('formLogin');
if (formLog) {
    formLog.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputEmail = document.getElementById("loginEmail");
        const inputPassword = document.getElementById("loginPassword");
        const aviso = document.getElementById("mensagemAviso");
        try {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inputEmail.value, password: inputPassword.value })
            });
            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem("token", data.access_token);
                window.location.replace("task.html");
            } else {
                aviso.textContent = "E-mail ou senha incorretos.";
                aviso.className = "erro";
            }
        } catch (error) {
            aviso.textContent = "Erro de conexão.";
            aviso.className = "erro";
        }
    });
}

async function renderTasks() {
    const corpoTabela = document.getElementById('corpoTabela');
    const token = localStorage.getItem("token");
    if (!corpoTabela || !token) return;
    try {
        const res = await fetch(`${BASE_URL}/tasks`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        const tasks = Array.isArray(data) ? data : (data.tasks || []);
        corpoTabela.innerHTML = "";
        tasks.forEach(t => {
            corpoTabela.innerHTML += `<tr><td>${t.title}</td><td class="text-right"><button class="btn-excluir" onclick="removeTask('${t.id}')">Excluir</button></td></tr>`;
        });
    } catch (err) {
        console.error(err);
    }
}

window.createTask = async () => {
    const input = document.getElementById("novaTarefa");
    const token = localStorage.getItem("token");
    if (!input.value.trim()) return;
    try {
        const res = await fetch(`${BASE_URL}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ title: input.value })
        });
        if (res.ok) {
            input.value = "";
            renderTasks();
        }
    } catch (err) {
        console.error(err);
    }
};

window.removeTask = async (id) => {
    const token = localStorage.getItem("token");
    if (!confirm("Excluir esta tarefa?")) return;
    try {
        await fetch(`${BASE_URL}/tasks/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        renderTasks();
    } catch (err) {
        console.error(err);
    }
};

window.logout = () => {
    localStorage.removeItem("token");
    window.location.replace("index.html");
};

if (document.getElementById('corpoTabela')) {
    window.addEventListener('load', renderTasks);
}