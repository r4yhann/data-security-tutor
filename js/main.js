document.addEventListener('DOMContentLoaded', () => {
    
    // Global Scroll Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('active'); }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ==========================================
    // Modulo 1 - Actividad 1: Terminal
    // ==========================================
    const terminalInput = document.getElementById('cmd-input');
    const terminalOutput = document.getElementById('terminal-output');
    let currentMissionStep = 1; 

    let fileSystem = {
        "clientes.csv": { content: "ID: 001, Nombre: Juan Perez, Tarjeta: 4532-XXXX-XXXX-1932\nID: 002, Nombre: Maria Lopez, Tarjeta: 4123-XXXX-XXXX-8921", perms: "777" },
        "notas_publicas.txt": { content: "Recordar reunión de seguridad el viernes a las 10am.", perms: "644" }
    };

    function completeStep(stepNumber) {
        const stepEl = document.getElementById(`step${stepNumber}`);
        if(stepEl) {
            stepEl.classList.remove('text-secondary');
            stepEl.classList.add('text-success', 'fw-bold');
            stepEl.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i><strong>Paso ${stepNumber}:</strong> Completado.`;
        }
        currentMissionStep++;
        
        if(currentMissionStep > 3) {
            const successMsg = document.getElementById('mission-success');
            if(successMsg) successMsg.classList.remove('d-none');
        }
    }

    if(terminalInput && terminalOutput) {
        terminalInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const commandFull = this.value.trim();
                const args = commandFull.split(' ').filter(val => val !== '');
                const cmd = args[0] ? args[0].toLowerCase() : '';
                
                if(commandFull !== "") {
                    const cmdLine = document.createElement('div');
                    cmdLine.innerHTML = `<span class="terminal-prompt">root@academy:~$</span> <span class="text-white">${commandFull}</span>`;
                    terminalInput.parentElement.before(cmdLine);

                    const responseLine = document.createElement('div');
                    responseLine.className = "mb-3 text-secondary";
                    
                    switch(cmd) {
                        case 'ls':
                            let lsOutput = "";
                            for (const file in fileSystem) {
                                let color = fileSystem[file].perms === "600" ? "text-danger" : "text-primary";
                                lsOutput += `<span class="${color}">${file}</span>  `;
                            }
                            responseLine.innerHTML = lsOutput || "Directorio vacío";
                            if(currentMissionStep === 1) completeStep(1);
                            break;
                        case 'cat':
                            const fileToRead = args[1];
                            if(fileToRead && fileSystem[fileToRead]) {
                                if(fileSystem[fileToRead].perms === "600") {
                                    responseLine.innerHTML = `cat: ${fileToRead}: <span class="text-white">${fileSystem[fileToRead].content}</span><br><span class="text-success">[Info] Acceso permitido. Eres el propietario.</span>`;
                                } else {
                                    responseLine.innerHTML = `<span class="text-white">${fileSystem[fileToRead].content}</span>`;
                                }
                                if(currentMissionStep === 2 && fileToRead === 'clientes.csv') completeStep(2);
                            } else {
                                responseLine.innerHTML = `cat: ${fileToRead || ''}: No existe el archivo`;
                            }
                            break;
                        case 'chmod':
                            const perms = args[1];
                            const fileToChange = args[2];
                            if(perms && fileToChange && fileSystem[fileToChange]) {
                                fileSystem[fileToChange].perms = perms;
                                responseLine.innerHTML = `Permisos de ${fileToChange} cambiados a ${perms}.`;
                                if(currentMissionStep === 3 && perms === '600' && fileToChange === 'clientes.csv') completeStep(3);
                            } else {
                                responseLine.innerHTML = "Uso: chmod [permisos] [archivo]";
                            }
                            break;
                        case 'clear':
                            terminalOutput.querySelectorAll('div:not(.terminal-input-row)').forEach(l => l.remove());
                            responseLine.innerHTML = "";
                            break;
                        default:
                            responseLine.innerHTML = `bash: ${cmd}: orden no encontrada`;
                    }
                    
                    if(cmd !== 'clear') terminalInput.parentElement.before(responseLine);
                    this.value = ''; 
                    terminalOutput.scrollTop = terminalOutput.scrollHeight;
                }
            }
        });
    }

    // ==========================================
    // Modulo 1 - Quiz
    // ==========================================
    const quizForm = document.getElementById('quiz-form');
    const resultDiv = document.getElementById('quiz-result');

    if(quizForm) {
        quizForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            let score = 0;
            const answers = { q1: 'b', q2: 'b', q3: 'c', q4: 'b', q5: 'b' }; 
            const formData = new FormData(quizForm);
            
            for(let [name, val] of formData.entries()) {
                if(val === answers[name]) score++;
            }

            quizForm.style.display = 'none';
            resultDiv.classList.remove('d-none');
            
            if(score === 5) {
                resultDiv.innerHTML = `<i class="bi bi-trophy-fill text-warning me-2"></i> ¡Perfecto! 5/5. Has superado la evaluación teórica del Módulo 1.
                <div class="mt-4"><a href="modulo2.html" class="btn btn-cyber w-100">Ir al Módulo 2 <i class="bi bi-arrow-right ms-2"></i></a></div>`;
                resultDiv.className = "mt-4 p-4 text-success fw-bold border border-success rounded bg-success bg-opacity-10 fs-5 text-center";
            } else {
                resultDiv.innerHTML = `
                    <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i> Obtuviste ${score} de 5.<br>
                    <span class="fs-6 fw-normal text-secondary mt-2 d-block">Revisa el contenido teórico y vuelve a intentarlo.</span>
                    <button onclick="location.reload()" class="btn btn-outline-warning mt-3">Reintentar</button>
                `;
                resultDiv.className = "mt-4 p-4 text-warning fw-bold border border-warning rounded bg-warning bg-opacity-10 fs-5 text-center";
            }

            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // ==========================================
    // Modulo 2 - Actividad 1: Motor DoD
    // ==========================================
    const grid = document.getElementById('memory-grid');
    const btnGenData = document.getElementById('btn-gen-data');
    const btnRunDod = document.getElementById('btn-run-dod');
    const recoveryBar = document.getElementById('recovery-bar');
    const recoveryPercent = document.getElementById('recovery-percent');
    let cells = [];

    if(grid && btnGenData && btnRunDod) {
        for(let i = 0; i < 90; i++) {
            const cell = document.createElement('div');
            cell.style.width = 'calc(10% - 4px)';
            cell.style.padding = '4px 0';
            cell.style.textAlign = 'center';
            cell.style.backgroundColor = 'var(--bg-main)';
            cell.style.color = '#333';
            cell.style.borderRadius = '2px';
            cell.textContent = '00';
            grid.appendChild(cell);
            cells.push(cell);
        }

        btnGenData.addEventListener('click', () => {
            cells.forEach(cell => {
                cell.textContent = Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
                cell.style.color = '#fff';
                cell.style.backgroundColor = '#0b301c'; 
            });
            btnRunDod.disabled = false;
            recoveryBar.style.width = '100%';
            recoveryBar.className = "progress-bar bg-danger";
            recoveryPercent.textContent = "100% (Alta)";
            recoveryPercent.className = "text-danger fw-bold";
        });

        btnRunDod.addEventListener('click', () => {
            btnGenData.disabled = true;
            btnRunDod.disabled = true;

            cells.forEach(cell => {
                cell.textContent = '00';
                cell.style.color = '#ff6b6b';
                cell.style.backgroundColor = '#2a0a0a';
            });
            recoveryBar.style.width = '40%';
            recoveryPercent.textContent = "40% (Parcial)";

            setTimeout(() => {
                cells.forEach(cell => {
                    cell.textContent = 'FF';
                    cell.style.color = '#ff6b6b';
                    cell.style.backgroundColor = '#4a0b0b';
                });
                recoveryBar.style.width = '10%';
                recoveryBar.className = "progress-bar bg-warning";
                recoveryPercent.textContent = "10% (Baja)";
                recoveryPercent.className = "text-warning fw-bold";
            }, 1500);

            setTimeout(() => {
                cells.forEach(cell => {
                    cell.textContent = Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
                    cell.style.color = 'var(--text-secondary)';
                    cell.style.backgroundColor = 'var(--bg-surface-hover)';
                });
                recoveryBar.style.width = '0%';
                recoveryBar.className = "progress-bar bg-success";
                recoveryPercent.textContent = "0% (Sanitizado)";
                recoveryPercent.className = "text-success fw-bold";
                btnGenData.disabled = false;
            }, 3000);
        });
    }

    // ==========================================
    // Modulo 2 - Actividad 2: Crypto-Shredding
    // ==========================================
    const cryptoInput = document.getElementById('crypto-input');
    const btnEncrypt = document.getElementById('btn-encrypt');
    const btnDecrypt = document.getElementById('btn-decrypt');
    const btnDestroyKey = document.getElementById('btn-destroy-key');
    const cryptoDisk = document.getElementById('crypto-disk');
    const cryptoKeyDisplay = document.getElementById('crypto-key');
    const cryptoResult = document.getElementById('crypto-result');
    let systemKey = null;

    if(cryptoInput && btnEncrypt) {
        btnEncrypt.addEventListener('click', () => {
            if(cryptoInput.value.trim() === '') return;
            systemKey = "MEK-" + Math.random().toString(36).substring(2, 10).toUpperCase();
            cryptoKeyDisplay.textContent = systemKey;
            cryptoKeyDisplay.className = "font-monospace text-success fw-bold";
            
            const encryptedData = btoa(cryptoInput.value);
            cryptoDisk.textContent = encryptedData;
            cryptoDisk.className = "font-monospace text-warning flex-grow-1";
            
            cryptoResult.textContent = "Datos almacenados y encriptados en hardware.";
            cryptoResult.className = "mt-3 text-success fw-bold small";
            cryptoInput.value = '';
        });

        btnDestroyKey.addEventListener('click', () => {
            systemKey = null;
            cryptoKeyDisplay.textContent = "NULL (Destruida)";
            cryptoKeyDisplay.className = "font-monospace text-danger fw-bold";
            cryptoResult.textContent = "Crypto-Erase ejecutado. Llave irrecuperable.";
            cryptoResult.className = "mt-3 text-danger fw-bold small";
        });

        btnDecrypt.addEventListener('click', () => {
            if(systemKey !== null && cryptoDisk.textContent !== "(Disco Vacío)") {
                // Descifrar visualmente
                cryptoResult.innerHTML = `Descifrado exitoso: <span class="text-white">${atob(cryptoDisk.textContent)}</span>`;
                cryptoResult.className = "mt-3 text-success fw-bold small";
            } else if (systemKey === null && cryptoDisk.textContent !== "(Disco Vacío)") {
                cryptoResult.innerHTML = "<i class='bi bi-x-octagon-fill'></i> ERROR CRÍTICO: Imposible descifrar datos. Llave no encontrada.";
                cryptoResult.className = "mt-3 text-danger fw-bold small";
            }
        });
    }

    // ==========================================
    // Modulo 2 - Actividad 3: Drag & Drop
    // ==========================================
    const draggables = document.querySelectorAll('.hw-item');
    const dropZones = document.querySelectorAll('.drop-zone');
    const ddFeedback = document.getElementById('dd-feedback');

    if(draggables.length > 0) {
        draggables.forEach(draggable => {
            draggable.addEventListener('dragstart', () => {
                draggable.classList.add('dragging');
                draggable.style.opacity = '0.5';
            });
            draggable.addEventListener('dragend', () => {
                draggable.classList.remove('dragging');
                draggable.style.opacity = '1';
            });
        });

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', e => {
                e.preventDefault(); // Permitir el drop
                zone.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            });
            zone.addEventListener('dragleave', () => {
                zone.style.backgroundColor = 'transparent';
            });
            zone.addEventListener('drop', e => {
                e.preventDefault();
                zone.style.backgroundColor = 'transparent';
                const draggable = document.querySelector('.dragging');
                
                if(draggable) {
                    const hwType = draggable.getAttribute('data-type');
                    const zoneAccept = zone.getAttribute('data-accept');
                    
                    if(hwType === zoneAccept) {
                        zone.querySelector('.dropped-items').appendChild(draggable);
                        draggable.setAttribute('draggable', 'false');
                        draggable.style.cursor = 'default';
                        draggable.className = "hw-item p-2 bg-success text-white border border-success rounded mt-2 small";
                        
                        ddFeedback.textContent = "✔ Método Correcto: Destrucción asegurada.";
                        ddFeedback.className = "mt-3 fw-bold small text-success";
                    } else {
                        ddFeedback.innerHTML = "✖ ALERTA FORENSE: Ese método es ineficaz para esa tecnología. Quedará remanencia de datos.";
                        ddFeedback.className = "mt-3 fw-bold small text-danger";
                    }
                }
            });
        });
    }

    // ==========================================
    // Modulo 2 - Quiz
    // ==========================================
    const quizFormM2 = document.getElementById('quiz-form-m2');
    const resultDivM2 = document.getElementById('quiz-result-m2');

    if(quizFormM2) {
        quizFormM2.addEventListener('submit', function(e) {
            e.preventDefault();
            let score = 0;
            const answers = { m2q1: 'b', m2q2: 'a', m2q3: 'b', m2q4: 'c', m2q5: 'b' }; 
            const formData = new FormData(quizFormM2);
            
            for(let [name, val] of formData.entries()) {
                if(val === answers[name]) score++;
            }

            quizFormM2.style.display = 'none';
            resultDivM2.classList.remove('d-none');
            
            if(score === 5) {
                resultDivM2.innerHTML = `<i class="bi bi-trophy-fill text-warning me-2"></i> ¡Perfecto! 5/5. Has superado la evaluación teórica del Módulo 2.
                <div class="mt-4"><a href="modulo3.html" class="btn btn-cyber w-100">Ir al Módulo 3 <i class="bi bi-arrow-right ms-2"></i></a></div>`;
                resultDivM2.className = "mt-4 p-4 text-success fw-bold border border-success rounded bg-success bg-opacity-10 fs-5 text-center";
            } else {
                resultDivM2.innerHTML = `<i class="bi bi-exclamation-triangle-fill text-warning me-2"></i> Obtuviste ${score} de 5.<br><span class="fs-6 fw-normal text-secondary mt-2 d-block">Revisa el contenido teórico y vuelve a intentarlo.</span><button onclick="location.reload()" class="btn btn-outline-warning mt-3">Reintentar</button>`;
                resultDivM2.className = "mt-4 p-4 text-warning fw-bold border border-warning rounded bg-warning bg-opacity-10 fs-5 text-center";
            }
            resultDivM2.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

// ==========================================
    // Modulo 3 - Actividad 1: Laboratorio DLP
    // ==========================================
    const btnScans = document.querySelectorAll('.btn-scan');
    const inputCcRegex = document.getElementById('regex-cc');
    const inputEmailRegex = document.getElementById('regex-email');

    if (btnScans.length > 0 && inputCcRegex && inputEmailRegex) {
        
        function inspectData(packetId, dest, body) {
            let action = "ALLOW";
            let reason = "Tráfico limpio.";
            let color = "success";

            try {
                const ccRegex = new RegExp(inputCcRegex.value);
                const emailRegex = new RegExp(inputEmailRegex.value);

                if (ccRegex.test(body)) {
                    action = "BLOCK";
                    reason = "Detección de Información Financiera (PCI).";
                    color = "danger";
                } 

                else if (!emailRegex.test(dest)) {
                    action = "WARNING";
                    reason = "Destino fuera de la red corporativa.";
                    color = "warning";
                }
            } catch (e) {
                action = "ERROR";
                reason = "Sintaxis RegEx inválida.";
                color = "danger";
            }

            const resDiv = document.getElementById(`res-${packetId}`);
            resDiv.className = `mt-3 p-2 rounded text-${color} bg-${color} bg-opacity-10 border border-${color}`;
            resDiv.innerHTML = `<i class="bi bi-shield-lock-fill"></i> DLP Action: <strong>${action}</strong> - ${reason}`;
        }

        btnScans.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const packetId = e.target.closest('button').getAttribute('data-target');
                const dest = document.getElementById(`dest-${packetId}`).innerText;
                const body = document.getElementById(`body-${packetId}`).innerText;
                inspectData(packetId, dest, body);
            });
        });
    }

    // ==========================================
    // Modulo 3 - Quiz
    // ==========================================
    const quizFormM3 = document.getElementById('quiz-form-m3');
    const resultDivM3 = document.getElementById('quiz-result-m3');

    if(quizFormM3) {
        quizFormM3.addEventListener('submit', function(e) {
            e.preventDefault();
            let score = 0;
            const answers = { m3q1: 'a', m3q2: 'b', m3q3: 'c', m3q4: 'b', m3q5: 'b' }; 
            const formData = new FormData(quizFormM3);
            
            for(let [name, val] of formData.entries()) {
                if(val === answers[name]) score++;
            }

            quizFormM3.style.display = 'none';
            resultDivM3.classList.remove('d-none');
            
            if(score === 5) {
                resultDivM3.innerHTML = `<i class="bi bi-trophy-fill text-warning me-2"></i> ¡Perfecto! 5/5. Has dominado los fundamentos de Prevención DLP.
                <div class="mt-4"><a href="modulo4.html" class="btn btn-cyber w-100">Ir al Módulo 4 <i class="bi bi-arrow-right ms-2"></i></a></div>`;
                resultDivM3.className = "mt-4 p-4 text-success fw-bold border border-success rounded bg-success bg-opacity-10 fs-5 text-center";
            } else {
                resultDivM3.innerHTML = `<i class="bi bi-exclamation-triangle-fill text-warning me-2"></i> Obtuviste ${score} de 5.<br><span class="fs-6 fw-normal text-secondary mt-2 d-block">Revisa el contenido teórico y vuelve a intentarlo.</span><button onclick="location.reload()" class="btn btn-outline-warning mt-3">Reintentar</button>`;
                resultDivM3.className = "mt-4 p-4 text-warning fw-bold border border-warning rounded bg-warning bg-opacity-10 fs-5 text-center";
            }
                resultDivM3.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
    });

    // ==========================================
    // Modulo 4 - Actividad 1: Privacy Hero
    // ==========================================
    const btnStartPh = document.getElementById('btn-start-ph');
    const phWord = document.getElementById('ph-word');
    const btnPersonal = document.getElementById('btn-personal');
    const btnSensible = document.getElementById('btn-sensible');
    const phScoreDisplay = document.getElementById('ph-score');
    const phFeedback = document.getElementById('ph-feedback');
    
    let phScore = 0;
    let currentData = null;
    let phInterval;
    
    const privacyData = [
        { word: "Dirección de Correo", type: "personal", exp: "Correcto. Es un identificador directo, pero no revela aspectos íntimos." },
        { word: "Religión", type: "sensible", exp: "Correcto. Su mal uso podría causar discriminación. Requiere alta protección." },
        { word: "Número de Teléfono", type: "personal", exp: "Correcto. Dato personal estándar de contacto." },
        { word: "Preferencia Sexual", type: "sensible", exp: "Correcto. Afecta la esfera más íntima del titular." },
        { word: "Dirección IP", type: "personal", exp: "Correcto. En ciberseguridad y GDPR, la IP identifica la ubicación y al usuario." },
        { word: "Tipo de Sangre", type: "sensible", exp: "Correcto. Es información clínica y de salud, altamente regulada (HIPAA)." },
        { word: "Nombre Completo", type: "personal", exp: "Correcto. Identificador primario directo." },
        { word: "Opinión Política", type: "sensible", exp: "Correcto. Históricamente, el mal manejo de este dato causa represión o profiling severo." }
    ];

    if(btnStartPh) {
        function nextPhWord() {
            if(privacyData.length === 0) {
                phWord.textContent = "¡SIMULACIÓN COMPLETADA!";
                phWord.className = "text-success fw-bold py-4 px-3 bg-success bg-opacity-25 rounded d-inline-block border border-success";
                btnPersonal.disabled = true;
                btnSensible.disabled = true;
                return;
            }
            const randomIndex = Math.floor(Math.random() * privacyData.length);
            currentData = privacyData.splice(randomIndex, 1)[0];
            phWord.textContent = currentData.word;
        }

        btnStartPh.addEventListener('click', () => {
            phScore = 0;
            phScoreDisplay.textContent = `Score: 0`;
            btnPersonal.disabled = false;
            btnSensible.disabled = false;
            btnStartPh.disabled = true;
            phFeedback.classList.add('d-none');
            phWord.className = "text-white fw-bold py-4 px-3 bg-secondary bg-opacity-25 rounded d-inline-block border border-secondary";
            nextPhWord();
        });

        function checkPhAnswer(selectedType) {
            if(!currentData) return;
            
            if(selectedType === currentData.type) {
                phScore += 10;
                phScoreDisplay.textContent = `Score: ${phScore}`;
                phFeedback.innerHTML = `✔ ${currentData.exp}`;
                phFeedback.className = "mt-3 p-3 text-center rounded fw-bold small border text-success bg-success bg-opacity-10 border-success";
                phFeedback.classList.remove('d-none');
                setTimeout(nextPhWord, 1500);
            } else {
                phWord.textContent = "INCIDENTE FORENSE";
                phWord.className = "text-danger fw-bold py-4 px-3 bg-danger bg-opacity-25 rounded d-inline-block border border-danger";
                phFeedback.innerHTML = `✖ ERROR CRÍTICO DE CLASIFICACIÓN.<br><span class="text-white fw-normal">"${currentData.word}" es un dato ${currentData.type.toUpperCase()}.<br>Motivo: ${currentData.exp}</span>`;
                phFeedback.className = "mt-3 p-3 text-center rounded fw-bold small border text-danger bg-danger bg-opacity-10 border-danger";
                phFeedback.classList.remove('d-none');
                btnPersonal.disabled = true;
                btnSensible.disabled = true;
                btnStartPh.disabled = false;
                btnStartPh.textContent = "Reiniciar Simulación";
            }
        }

        btnPersonal.addEventListener('click', () => checkPhAnswer('personal'));
        btnSensible.addEventListener('click', () => checkPhAnswer('sensible'));
    }

    // ==========================================
    // Modulo 4 - Actividad 2: Terminal ARCO
    // ==========================================
    const cmdArco = document.getElementById('cmd-arco');
    const terminalArco = document.getElementById('terminal-arco');
    
    let dbArco = [
        { id: 101, name: "Ana Vega", email: "ana@correo.com", sensitive: "NULL" },
        { id: 102, name: "Luis Gil", email: "luis@correo.com", sensitive: "NULL" },
        { id: 104, name: "Juan P.", email: "juan@correo.com", sensitive: "A+ Sanguíneo" }
    ];
    let auditLog = [];

    if(cmdArco && terminalArco) {
        cmdArco.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const cmdString = this.value.trim();
                if(cmdString === "") return;

                const cmdLine = document.createElement('div');
                cmdLine.innerHTML = `<span class="text-success font-monospace me-2">dpo@arco:~$</span> <span class="text-white">${cmdString}</span>`;
                cmdArco.parentElement.before(cmdLine);

                const responseLine = document.createElement('div');
                responseLine.className = "mb-3 text-secondary font-monospace small";
                
                if (cmdString === "ls users/") {
                    responseLine.innerHTML = dbArco.map(u => `user_${u.id}.json`).join('  ');
                } 
                else if (cmdString === "search --email \"juan@correo.com\"") {
                    const found = dbArco.find(u => u.email === "juan@correo.com");
                    responseLine.innerHTML = found ? `[Búsqueda Exitosa] ID vinculado al correo: <span class="text-info">${found.id}</span>` : "Error: Correo no encontrado en la base de datos activa.";
                }
                else if (cmdString === "cat users/user_04.json" || cmdString === "cat users/user_104.json") {
                    const found = dbArco.find(u => u.id === 104);
                    responseLine.innerHTML = found ? `{<br>  "id": 104,<br>  "name": "Juan P.",<br>  "email": "juan@correo.com",<br>  "sensitive": <span class="text-danger">"A+ Sanguíneo"</span><br>}` : "cat: archivo no encontrado.";
                }
                else if (cmdString === "delete --id 104 --confirm") {
                    const idx = dbArco.findIndex(u => u.id === 104);
                    if (idx !== -1) {
                        dbArco.splice(idx, 1);
                        const logEntry = `ARCO_DEL_2026: Usuario 104 purgado. Autorizado por DPO.`;
                        auditLog.push(logEntry);
                        responseLine.innerHTML = `<span class="text-danger fw-bold">SUCCESS:</span> Registros del usuario 104 eliminados de las bases primarias. Certificado de destrucción lógica generado.`;
                    } else {
                        responseLine.innerHTML = "Error: ID 104 no existe o ya fue eliminado.";
                    }
                }
                else if (cmdString === "audit --log") {
                    responseLine.innerHTML = auditLog.length > 0 ? auditLog.join('<br>') : "No hay registros de auditoría de eliminación hoy.";
                }
                else {
                    responseLine.innerHTML = `bash: ${cmdString.split(' ')[0]}: comando no reconocido o sintaxis inválida.`;
                }

                cmdArco.parentElement.before(responseLine);
                this.value = ''; 
                terminalArco.scrollTop = terminalArco.scrollHeight;
            }
        });
    }

    // ==========================================
    // Modulo 4 - Quiz
    // ==========================================
    const quizFormM4 = document.getElementById('quiz-form-m4');
    const resultDivM4 = document.getElementById('quiz-result-m4');

    if(quizFormM4) {
        quizFormM4.addEventListener('submit', function(e) {
            e.preventDefault();
            let score = 0;
            const answers = { m4q1: 'b', m4q2: 'c', m4q3: 'b', m4q4: 'b', m4q5: 'b' }; 
            const formData = new FormData(quizFormM4);
            
            for(let [name, val] of formData.entries()) {
                if(val === answers[name]) score++;
            }

            quizFormM4.style.display = 'none';
            resultDivM4.classList.remove('d-none');
            
            if(score === 5) {
                resultDivM4.innerHTML = `<i class="bi bi-trophy-fill text-warning me-2"></i> ¡Perfecto! 5/5. Has finalizado exitosamente el curso.
                <div class="mt-4"><a href="examen-final.html" class="btn btn-cyber w-100" style="background-color: var(--success-green); border-color: var(--success-green);">Ir al Examen Final Global <i class="bi bi-award-fill ms-2"></i></a></div>`;
                resultDivM4.className = "mt-4 p-4 text-success fw-bold border border-success rounded bg-success bg-opacity-10 fs-5 text-center";
            } else {
                resultDivM4.innerHTML = `<i class="bi bi-exclamation-triangle-fill text-warning me-2"></i> Obtuviste ${score} de 5.<br><span class="fs-6 fw-normal text-secondary mt-2 d-block">Revisa el contenido teórico y vuelve a intentarlo.</span><button onclick="location.reload()" class="btn btn-outline-warning mt-3">Reintentar</button>`;
                resultDivM4.className = "mt-4 p-4 text-warning fw-bold border border-warning rounded bg-warning bg-opacity-10 fs-5 text-center";
            }
            resultDivM4.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    // ==========================================
    // Examen Final Global
    // ==========================================
    const quizFormFinal = document.getElementById('quiz-form-final');
    const resultDivFinal = document.getElementById('quiz-result-final');

    if(quizFormFinal) {
        quizFormFinal.addEventListener('submit', function(e) {
            e.preventDefault();
            let score = 0;
            // Respuestas de las 20 preguntas
            const answers = { 
                fq1: 'b', fq2: 'b', fq3: 'c', fq4: 'b', fq5: 'b',
                fq6: 'b', fq7: 'a', fq8: 'b', fq9: 'c', fq10: 'b',
                fq11: 'a', fq12: 'b', fq13: 'c', fq14: 'b', fq15: 'b',
                fq16: 'b', fq17: 'c', fq18: 'b', fq19: 'b', fq20: 'b' 
            }; 
            const formData = new FormData(quizFormFinal);
            
            for(let [name, val] of formData.entries()) {
                if(val === answers[name]) score++;
            }

            quizFormFinal.style.display = 'none';
            resultDivFinal.classList.remove('d-none');
            
            // Evaluamos: 16 de 20 es un 80% (Aprobatorio)
            if(score >= 16) {
                resultDivFinal.innerHTML = `
                    <i class="bi bi-patch-check-fill text-success" style="font-size: 4rem;"></i>
                    <h2 class="mt-3 text-white fw-bold">¡Felicidades, aprobaste!</h2>
                    <p class="text-secondary mt-2 fs-5">Obtuviste ${score} de 20 aciertos correctos.</p>
                    <div class="alert bg-success bg-opacity-25 border border-success text-white mt-4 p-4 text-start">
                        <i class="bi bi-quote text-success fs-3"></i><br>
                        Ahora eres conocedor experto de los pilares de la Seguridad en la Gestión de Datos, dominando las técnicas forenses de Destrucción, la Prevención de Filtraciones (DLP) y el cumplimiento ético de Privacidad. Estás listo para proteger los activos más valiosos de cualquier organización corporativa.
                    </div>
                    <a href="index.html" class="btn btn-cyber mt-4 px-5 py-3"><i class="bi bi-house-door-fill me-2"></i> Volver al Inicio</a>
                `;
                resultDivFinal.className = "mt-4 p-5 text-center border border-success rounded bg-dark";
            } else {
                resultDivFinal.innerHTML = `
                    <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size: 4rem;"></i>
                    <h2 class="mt-3 text-white fw-bold">No has aprobado la certificación</h2>
                    <p class="text-secondary fs-5">Obtuviste ${score} de 20. Necesitas al menos 16 aciertos para aprobar.</p>
                    <button onclick="location.reload()" class="btn btn-outline-danger mt-4 px-5 py-3"><i class="bi bi-arrow-clockwise me-2"></i> Reintentar Examen</button>
                `;
                resultDivFinal.className = "mt-4 p-5 text-center border border-danger rounded bg-dark";
            }
            
            resultDivFinal.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
