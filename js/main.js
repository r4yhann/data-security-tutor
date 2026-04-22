"use strict";

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 0. Utilidades Globales y Animaciones
    // ==========================================
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { entry.target.classList.add('active'); }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    const vibrate = (pattern) => {
        if ("vibrate" in navigator) navigator.vibrate(pattern);
    };

    const typeWriterEffect = (element, text, speed = 10, callback = null) => {
        element.innerHTML = '';
        let i = 0;
        let isHTML = false;
        let htmlBuffer = '';

        const type = () => {
            if (i < text.length) {
                let char = text.charAt(i);
                if (char === '<') isHTML = true;
                
                if (isHTML) {
                    htmlBuffer += char;
                    if (char === '>') {
                        isHTML = false;
                        element.innerHTML += htmlBuffer;
                        htmlBuffer = '';
                    }
                } else {
                    element.innerHTML += char;
                }
                i++;
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        };
        type();
    };

    const setupTerminalInput = (input) => {
        if(!input) return;
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('spellcheck', 'false');
    };

    // ==========================================
    // Modulo 1 - Actividad 1: Terminal
    // ==========================================
    
    const terminalInput = document.getElementById('cmd-input');
    const terminalOutput = document.getElementById('terminal-output');
    let currentMissionStep = 1; 

    let fileSystem = {
        "clientes.csv": { content: "ID: 001, Nombre: Juan Perez, Tarjeta: 4532-XXXX-XXXX-1932<br>ID: 002, Nombre: Maria Lopez, Tarjeta: 4123-XXXX-XXXX-8921", perms: "777" },
        "notas_publicas.txt": { content: "Recordar reunión de seguridad el viernes a las 10am.", perms: "644" }
    };

    setupTerminalInput(terminalInput);

    function completeStep(stepNumber) {
        const stepEl = document.getElementById(`step${stepNumber}`);
        if(stepEl) {
            stepEl.classList.remove('text-secondary');
            stepEl.classList.add('text-success', 'fw-bold');
            stepEl.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i><strong>Paso ${stepNumber}:</strong> Completado.`;
            vibrate([50, 50, 50]); 
        }
        currentMissionStep++;
        
        if(currentMissionStep > 3) {
            const successMsg = document.getElementById('mission-success');
            if(successMsg) successMsg.classList.remove('d-none');
        }
    }

    if(terminalInput && terminalOutput) {
        terminalInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const commandFull = this.value.trim();
                const args = commandFull.split(' ').filter(val => val !== '');
                const cmd = args[0] ? args[0].toLowerCase() : '';
                
                if(commandFull !== "") {
                    const cmdLine = document.createElement('div');
                    cmdLine.innerHTML = `<span class="terminal-prompt">root@academy:~$</span> <span class="text-white">${commandFull}</span>`;
                    terminalInput.parentElement.before(cmdLine);

                    const responseLine = document.createElement('div');
                    responseLine.className = "mb-3 text-secondary";
                    let responseText = "";
                    
                    switch(cmd) {
                        case 'ls':
                            for (const file in fileSystem) {
                                let color = fileSystem[file].perms === "600" ? "text-danger" : "text-info";
                                responseText += `<span class="${color}">${file}</span>  `;
                            }
                            if(!responseText) responseText = "Directorio vacío";
                            if(currentMissionStep === 1) completeStep(1);
                            break;
                        case 'cat':
                            const fileToRead = args[1];
                            if(fileToRead && fileSystem[fileToRead]) {
                                if(fileSystem[fileToRead].perms === "600") {
                                    responseText = `cat: ${fileToRead}: <br><span class="text-white">${fileSystem[fileToRead].content}</span><br><span class="text-success">[Info] Acceso permitido. Eres el propietario.</span>`;
                                } else {
                                    responseText = `<span class="text-white">${fileSystem[fileToRead].content}</span>`;
                                }
                                if(currentMissionStep === 2 && fileToRead === 'clientes.csv') completeStep(2);
                            } else {
                                responseText = `cat: ${fileToRead || ''}: No existe el archivo`;
                            }
                            break;
                        case 'chmod':
                            const perms = args[1];
                            const fileToChange = args[2];
                            if(perms && fileToChange && fileSystem[fileToChange]) {
                                fileSystem[fileToChange].perms = perms;
                                responseText = `Permisos de ${fileToChange} cambiados a ${perms}.`;
                                if(currentMissionStep === 3 && perms === '600' && fileToChange === 'clientes.csv') completeStep(3);
                            } else {
                                responseText = "Uso: chmod [permisos] [archivo]";
                            }
                            break;
                        case 'clear':
                            terminalOutput.querySelectorAll('div:not(.terminal-input-row)').forEach(l => l.remove());
                            break;
                        default:
                            responseText = `bash: ${cmd}: orden no encontrada`;
                    }
                    
                    if(cmd !== 'clear') {
                        terminalInput.parentElement.before(responseLine);
                        terminalInput.disabled = true;
                        typeWriterEffect(responseLine, responseText, 5, () => {
                            terminalInput.disabled = false;
                            terminalInput.focus();
                            terminalOutput.scrollTop = terminalOutput.scrollHeight;
                        });
                    }
                    this.value = ''; 
                }
            }
        });
    }

    // ==========================================
    // SISTEMA DE QUIZZES (Todos los módulos)
    // ==========================================
    
    const handleQuizSubmit = (formId, resultId, answers, successHtml, failHtml, reqScore) => {
        const form = document.getElementById(formId);
        const resultDiv = document.getElementById(resultId);
        if(!form || !resultDiv) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault(); 
            let score = 0;
            const formData = new FormData(form);
            
            for(let [name, val] of formData.entries()) {
                if(val === answers[name]) score++;
            }

            form.style.display = 'none';
            resultDiv.classList.remove('d-none');
            
            if(score >= reqScore) {
                resultDiv.innerHTML = successHtml.replace('{score}', score);
                resultDiv.className = "mt-4 p-4 text-success fw-bold border border-success rounded bg-success bg-opacity-10 fs-5 text-center";
                vibrate([100, 100, 100]); 
            } else {
                resultDiv.innerHTML = failHtml.replace('{score}', score);
                resultDiv.className = "mt-4 p-4 text-warning fw-bold border border-warning rounded bg-warning bg-opacity-10 fs-5 text-center";
                vibrate([200]);
            }
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    };

    // Quiz Módulo 1
    handleQuizSubmit('quiz-form', 'quiz-result', { q1: 'b', q2: 'b', q3: 'c', q4: 'b', q5: 'b' }, 
        `<i class="bi bi-trophy-fill text-warning me-2"></i> ¡Perfecto! {score}/5. Has superado la evaluación.<div class="mt-4"><a href="modulo2.html" class="btn btn-cyber w-100">Ir al Módulo 2 <i class="bi bi-arrow-right ms-2"></i></a></div>`, 
        `<i class="bi bi-exclamation-triangle-fill text-warning me-2"></i> Obtuviste {score} de 5.<br><span class="fs-6 fw-normal text-secondary mt-2 d-block">Revisa la teoría e intenta de nuevo.</span><button onclick="location.reload()" class="btn btn-outline-warning mt-3">Reintentar</button>`, 5);

    // Quiz Módulo 2
    handleQuizSubmit('quiz-form-m2', 'quiz-result-m2', { m2q1: 'b', m2q2: 'a', m2q3: 'b', m2q4: 'c', m2q5: 'b' }, 
        `<i class="bi bi-trophy-fill text-warning me-2"></i> ¡Perfecto! {score}/5. Has superado la evaluación.<div class="mt-4"><a href="modulo3.html" class="btn btn-cyber w-100">Ir al Módulo 3 <i class="bi bi-arrow-right ms-2"></i></a></div>`, 
        `<i class="bi bi-exclamation-triangle-fill text-warning me-2"></i> Obtuviste {score} de 5.<br><span class="fs-6 fw-normal text-secondary mt-2 d-block">Revisa la teoría e intenta de nuevo.</span><button onclick="location.reload()" class="btn btn-outline-warning mt-3">Reintentar</button>`, 5);

    // Quiz Módulo 3
    handleQuizSubmit('quiz-form-m3', 'quiz-result-m3', { m3q1: 'a', m3q2: 'b', m3q3: 'c', m3q4: 'b', m3q5: 'b' }, 
        `<i class="bi bi-trophy-fill text-warning me-2"></i> ¡Perfecto! {score}/5. Has superado la evaluación.<div class="mt-4"><a href="modulo4.html" class="btn btn-cyber w-100">Ir al Módulo 4 <i class="bi bi-arrow-right ms-2"></i></a></div>`, 
        `<i class="bi bi-exclamation-triangle-fill text-warning me-2"></i> Obtuviste {score} de 5.<br><span class="fs-6 fw-normal text-secondary mt-2 d-block">Revisa la teoría e intenta de nuevo.</span><button onclick="location.reload()" class="btn btn-outline-warning mt-3">Reintentar</button>`, 5);

    // Quiz Módulo 4
    handleQuizSubmit('quiz-form-m4', 'quiz-result-m4', { m4q1: 'b', m4q2: 'c', m4q3: 'b', m4q4: 'b', m4q5: 'b' }, 
        `<i class="bi bi-trophy-fill text-warning me-2"></i> ¡Perfecto! {score}/5. Has superado la evaluación.<div class="mt-4"><a href="examen-final.html" class="btn btn-cyber w-100">Ir al Examen Final Global <i class="bi bi-arrow-right ms-2"></i></a></div>`, 
        `<i class="bi bi-exclamation-triangle-fill text-warning me-2"></i> Obtuviste {score} de 5.<br><span class="fs-6 fw-normal text-secondary mt-2 d-block">Revisa la teoría e intenta de nuevo.</span><button onclick="location.reload()" class="btn btn-outline-warning mt-3">Reintentar</button>`, 5);

    // Examen Final
    handleQuizSubmit('quiz-form-final', 'quiz-result-final', {
        fq1: 'b', fq2: 'b', fq3: 'c', fq4: 'b', fq5: 'b',
        fq6: 'b', fq7: 'a', fq8: 'b', fq9: 'c', fq10: 'b',
        fq11: 'a', fq12: 'b', fq13: 'c', fq14: 'b', fq15: 'b',
        fq16: 'b', fq17: 'c', fq18: 'b', fq19: 'b', fq20: 'b'
    },
    `
        <i class="bi bi-patch-check-fill text-success" style="font-size: 4rem;"></i>
        <h2 class="mt-3 text-white fw-bold">¡Felicidades, aprobaste!</h2>
        <p class="text-secondary mt-2 fs-5">Obtuviste {score} de 20 aciertos correctos.</p>
        <div class="alert bg-success bg-opacity-25 border border-success text-white mt-4 p-4 text-start">
            <i class="bi bi-quote text-success fs-3"></i><br>
            Ahora eres conocedor experto de los pilares de la Seguridad en la Gestión de Datos, dominando las técnicas forenses de Destrucción, la Prevención de Filtraciones (DLP) y el cumplimiento ético de Privacidad. Estás listo para proteger los activos más valiosos de cualquier organización corporativa.
        </div>
        <a href="index.html" class="btn btn-cyber mt-4 px-5 py-3"><i class="bi bi-house-door-fill me-2"></i> Volver al Inicio</a>
    `,
    `
        <i class="bi bi-exclamation-triangle-fill text-danger" style="font-size: 4rem;"></i>
        <h2 class="mt-3 text-white fw-bold">No has aprobado la certificación</h2>
        <p class="text-secondary fs-5">Obtuviste {score} de 20. Necesitas al menos 16 aciertos para aprobar.</p>
        <button onclick="location.reload()" class="btn btn-outline-danger mt-4 px-5 py-3"><i class="bi bi-arrow-clockwise me-2"></i> Reintentar Examen</button>
    `, 16);


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
            cell.style.backgroundColor = 'transparent';
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
            cryptoDisk.className = "font-monospace text-warning flex-grow-1 mb-3";
            
            cryptoResult.textContent = "Datos almacenados y encriptados en hardware.";
            cryptoResult.className = "mt-4 text-center text-success fw-bold small p-2 rounded bg-success bg-opacity-10 border border-success";
            cryptoInput.value = '';
        });

        btnDestroyKey.addEventListener('click', () => {
            systemKey = null;
            cryptoKeyDisplay.textContent = "NULL (Destruida)";
            cryptoKeyDisplay.className = "font-monospace text-danger fw-bold";
            cryptoResult.textContent = "Crypto-Erase ejecutado. Llave irrecuperable.";
            cryptoResult.className = "mt-4 text-center text-danger fw-bold small p-2 rounded bg-danger bg-opacity-10 border border-danger";
            vibrate([100, 50, 100]);
        });

        btnDecrypt.addEventListener('click', () => {
            if(systemKey !== null && cryptoDisk.textContent !== "(Disco Vacío)") {
                cryptoResult.innerHTML = `Descifrado exitoso: <span class="text-white">${atob(cryptoDisk.textContent)}</span>`;
                cryptoResult.className = "mt-4 text-center text-success fw-bold small p-2 rounded bg-success bg-opacity-10 border border-success";
            } else if (systemKey === null && cryptoDisk.textContent !== "(Disco Vacío)") {
                cryptoResult.innerHTML = "<i class='bi bi-x-octagon-fill'></i> ERROR CRÍTICO: Imposible descifrar datos. Llave no encontrada.";
                cryptoResult.className = "mt-4 text-center text-danger fw-bold small p-2 rounded bg-danger bg-opacity-10 border border-danger";
                vibrate(200);
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
        let activeDraggable = null;

        const processDrop = (draggable, zone) => {
            const hwType = draggable.getAttribute('data-type');
            const zoneAccept = zone.getAttribute('data-accept');
            
            if(hwType === zoneAccept) {
                zone.querySelector('.dropped-items').appendChild(draggable);
                draggable.setAttribute('draggable', 'false');
                draggable.className = "hw-item p-2 bg-success text-white border border-success rounded mt-2 small";
                draggable.style.cursor = 'default';
                ddFeedback.textContent = "✔ Método Correcto: Destrucción asegurada.";
                ddFeedback.className = "mt-4 text-center fw-bold small p-2 rounded bg-success bg-opacity-10 border border-success text-success";
                vibrate([50, 50]);
            } else {
                ddFeedback.innerHTML = "✖ ALERTA FORENSE: Ese método es ineficaz para esa tecnología.";
                ddFeedback.className = "mt-4 text-center fw-bold small p-2 rounded bg-danger bg-opacity-10 border border-danger text-danger";
                vibrate([200]);
            }
        };

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
                e.preventDefault();
                zone.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            });
            zone.addEventListener('dragleave', () => {
                zone.style.backgroundColor = 'transparent';
            });
            zone.addEventListener('drop', e => {
                e.preventDefault();
                zone.style.backgroundColor = 'transparent';
                const draggable = document.querySelector('.dragging');
                if(draggable) processDrop(draggable, zone);
            });
        });

        draggables.forEach(draggable => {
            draggable.addEventListener('touchstart', (e) => {
                if(draggable.getAttribute('draggable') === 'false') return;
                activeDraggable = draggable;
                draggable.classList.add('dragging');
                draggable.style.opacity = '0.7';
                vibrate(15);
            }, {passive: true});

            draggable.addEventListener('touchmove', (e) => {
                if (!activeDraggable) return;
                e.preventDefault(); 
                const touch = e.touches[0];
                
                activeDraggable.style.position = 'fixed';
                activeDraggable.style.left = `${touch.clientX - (activeDraggable.offsetWidth / 2)}px`;
                activeDraggable.style.top = `${touch.clientY - (activeDraggable.offsetHeight / 2)}px`;
                activeDraggable.style.zIndex = '1000';

                const elemUnder = document.elementFromPoint(touch.clientX, touch.clientY);
                dropZones.forEach(zone => {
                    if(zone === elemUnder || zone.contains(elemUnder)) {
                        zone.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    } else {
                        zone.style.backgroundColor = 'transparent';
                    }
                });
            }, {passive: false});

            draggable.addEventListener('touchend', (e) => {
                if (!activeDraggable) return;
                
                activeDraggable.style.position = '';
                activeDraggable.style.left = '';
                activeDraggable.style.top = '';
                activeDraggable.style.zIndex = '';
                activeDraggable.style.opacity = '1';
                activeDraggable.classList.remove('dragging');

                const touch = e.changedTouches[0];
                const elemUnder = document.elementFromPoint(touch.clientX, touch.clientY);
                
                let targetZone = null;
                dropZones.forEach(zone => {
                    zone.style.backgroundColor = 'transparent';
                    if(zone === elemUnder || zone.contains(elemUnder)) targetZone = zone;
                });

                if(targetZone) processDrop(activeDraggable, targetZone);
                activeDraggable = null;
            });
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
            resDiv.className = `mt-3 p-2 rounded text-${color} bg-${color} bg-opacity-10 border border-${color} font-monospace`;
            resDiv.innerHTML = `<i class="bi bi-shield-lock-fill"></i> DLP Action: <strong>${action}</strong> - ${reason}`;
            resDiv.classList.remove('d-none');
            
            if(color === "danger" || color === "warning") vibrate(100);
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
    let privacyData = [];
    
    const initialPrivacyData = [
        { word: "Dirección de Correo", type: "personal", exp: "Correcto. Es un identificador directo, pero no revela aspectos íntimos." },
        { word: "Religión", type: "sensible", exp: "Correcto. Su mal uso podría causar discriminación. Requiere alta protección." },
        { word: "Número de Teléfono", type: "personal", exp: "Correcto. Dato personal estándar de contacto." },
        { word: "Preferencia Sexual", type: "sensible", exp: "Correcto. Afecta la esfera más íntima del titular." },
        { word: "Dirección IP", type: "personal", exp: "Correcto. Identifica la ubicación y al usuario." },
        { word: "Tipo de Sangre", type: "sensible", exp: "Correcto. Es información clínica y de salud, altamente regulada." },
        { word: "Nombre Completo", type: "personal", exp: "Correcto. Identificador primario directo." },
        { word: "Opinión Política", type: "sensible", exp: "Correcto. El mal manejo de este dato causa profiling severo." }
    ];

    if(btnStartPh) {
        function nextPhWord() {
            if(privacyData.length === 0) {
                phWord.textContent = "¡SIMULACIÓN COMPLETADA!";
                phWord.className = "text-success fw-bold py-4 px-3 bg-success bg-opacity-25 rounded d-inline-block border border-success";
                btnPersonal.disabled = true;
                btnSensible.disabled = true;
                btnStartPh.disabled = false;
                btnStartPh.textContent = "Volver a jugar";
                return;
            }
            const randomIndex = Math.floor(Math.random() * privacyData.length);
            currentData = privacyData.splice(randomIndex, 1)[0];
            phWord.textContent = currentData.word;
        }

        btnStartPh.addEventListener('click', () => {
            phScore = 0;
            privacyData = [...initialPrivacyData]; // Resetear array
            phScoreDisplay.textContent = `Score: 0`;
            btnPersonal.disabled = false;
            btnSensible.disabled = false;
            btnStartPh.disabled = true;
            phFeedback.classList.add('d-none');
            phWord.className = "text-white fw-bold py-4 px-4 bg-secondary bg-opacity-25 rounded d-inline-block border border-secondary";
            nextPhWord();
        });

        function checkPhAnswer(selectedType) {
            if(!currentData) return;
            
            if(selectedType === currentData.type) {
                phScore += 10;
                phScoreDisplay.textContent = `Score: ${phScore}`;
                phFeedback.innerHTML = `✔ ${currentData.exp}`;
                phFeedback.className = "mt-4 p-3 text-center rounded fw-bold small border text-success bg-success bg-opacity-10 border-success";
                phFeedback.classList.remove('d-none');
                vibrate(50); 
                setTimeout(nextPhWord, 1500);
            } else {
                phWord.textContent = "INCIDENTE FORENSE";
                phWord.className = "text-danger fw-bold py-4 px-4 bg-danger bg-opacity-25 rounded d-inline-block border border-danger";
                phFeedback.innerHTML = `✖ ERROR CRÍTICO DE CLASIFICACIÓN.<br><span class="text-white fw-normal">"${currentData.word}" es un dato ${currentData.type.toUpperCase()}.<br>Motivo: ${currentData.exp}</span>`;
                phFeedback.className = "mt-4 p-3 text-center rounded fw-bold small border text-danger bg-danger bg-opacity-10 border-danger";
                phFeedback.classList.remove('d-none');
                vibrate([100, 50, 100]); 
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

    setupTerminalInput(cmdArco);

    if(cmdArco && terminalArco) {
        cmdArco.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const cmdString = this.value.trim();
                if(cmdString === "") return;

                const cmdLine = document.createElement('div');
                cmdLine.innerHTML = `<span class="text-success font-monospace me-2">dpo@arco:~$</span> <span class="text-white font-monospace">${cmdString}</span>`;
                cmdArco.parentElement.before(cmdLine);

                const responseLine = document.createElement('div');
                responseLine.className = "mb-3 text-secondary font-monospace small";
                let responseText = "";
                
                if (cmdString === "ls users/") { 
                    responseText = dbArco.length > 0 ? dbArco.map(u => `user_${u.id}.json`).join('  ') : "Directorio vacío.";
                } 
                else if (cmdString === "search --email \"juan@correo.com\"") {
                    const found = dbArco.find(u => u.email === "juan@correo.com");
                    responseText = found ? `[Búsqueda Exitosa] ID vinculado al correo: <span class="text-info">${found.id}</span>` : "Error: Correo no encontrado en la base de datos activa.";
                }
                else if (cmdString === "cat users/user_04.json" || cmdString === "cat users/user_104.json") {
                    const found = dbArco.find(u => u.id === 104);
                    responseText = found ? `{<br>  "id": 104,<br>  "name": "Juan P.",<br>  "email": "juan@correo.com",<br>  "sensitive": <span class="text-danger">"A+ Sanguíneo"</span><br>}` : "cat: archivo no encontrado.";
                }
                else if (cmdString === "delete --id 104 --confirm") {
                    const idx = dbArco.findIndex(u => u.id === 104);
                    if (idx !== -1) {
                        dbArco.splice(idx, 1);
                        const logEntry = `[${new Date().toLocaleTimeString()}] ARCO_DEL_2026: Usuario 104 purgado. Autorizado por DPO.`;
                        auditLog.push(logEntry);
                        responseText = `<span class="text-danger fw-bold">SUCCESS:</span> Registros del usuario 104 eliminados de las bases primarias. Certificado de destrucción lógica generado.`;
                        vibrate(50);
                    } else {
                        responseText = "Error: ID 104 no existe o ya fue eliminado.";
                    }
                }
                else if (cmdString === "audit --log") {
                    responseText = auditLog.length > 0 ? auditLog.join('<br>') : "No hay registros de auditoría de eliminación hoy.";
                }
                else if (cmdString === "clear") {
                    terminalArco.querySelectorAll('div:not(.terminal-input-row)').forEach(l => l.remove());
                }
                else {
                    responseText = `bash: ${cmdString.split(' ')[0]}: comando no reconocido o sintaxis inválida.`;
                }

                if(cmdString !== "clear") {
                    cmdArco.parentElement.before(responseLine);
                    cmdArco.disabled = true;
                    
                    typeWriterEffect(responseLine, responseText, 5, () => {
                        cmdArco.disabled = false;
                        cmdArco.focus();
                        terminalArco.scrollTop = terminalArco.scrollHeight;
                    });
                }
                this.value = ''; 
            }
        });
    }

});
