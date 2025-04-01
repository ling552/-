const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const debug = document.getElementById('debug');

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initializeDigits();
            
            // 调整UI元素位置
            const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
            toggleButton.style.transform = `scale(${scale})`;
            toggleButton.style.transformOrigin = 'top right';
        }
        
        class Particle {
            constructor(x, y) {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.targetX = x;
                this.targetY = y;
                this.speed = 0.12;
                this.size = 1.8;     // 稍微减小粒子大小，使显示更密集
                this.color = '#fff';
                this.alpha = 1;
            }

            update() {
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                this.x += dx * this.speed;
                this.y += dy * this.speed;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            setTarget(x, y) {
                this.targetX = x;
                this.targetY = y;
            }
        }

        class Digit {
            constructor(x, y, size) {
                this.x = x;
                this.y = y;
                this.size = size;
                this.particles = [];
                this.currentDigit = null;
                this.targetDigit = null;
                this.isScattered = false;
                this.scatterAmount = 30;
                this.isSecond = false;
                
                this.particlesPerPoint = 3;  // 增加每个点的粒子数量
            }

            setDigit(digit, immediate = false) {
                if (this.currentDigit === digit && !this.isScattered) return;
                
                this.targetDigit = digit;
                const points = this.getDigitPoints(digit);
                
                // 动态调整粒子数量
                const neededParticles = points.length * this.particlesPerPoint;
                while (this.particles.length < neededParticles) {
                    this.particles.push(new Particle(this.x, this.y));
                }
                while (this.particles.length > neededParticles) {
                    this.particles.pop();
                }

                if (immediate) {
                    this.currentDigit = digit;
                    this._updateParticlePositions();
                } else if (this.currentDigit !== null && !this.isScattered) {
                    this.scatter(() => {
                        this.currentDigit = digit;
                        this._updateParticlePositions();
                    });
                } else {
                    this.currentDigit = digit;
                    this._updateParticlePositions();
                }
            }

            _updateParticlePositions() {
                const points = this.getDigitPoints(this.currentDigit);
                let particleIndex = 0;
                
                points.forEach(point => {
                    for (let i = 0; i < this.particlesPerPoint; i++) {
                        const particle = this.particles[particleIndex++];
                        if (particle) {
                            // 添加小范围随机偏移，使显示更自然
                            const offsetX = (Math.random() - 0.5) * 0.3;
                            const offsetY = (Math.random() - 0.5) * 0.3;
                            particle.setTarget(
                                this.x + point[0] * this.size + offsetX,
                                this.y + point[1] * this.size + offsetY
                            );
                        }
                    }
                });
            }

            scatter(callback = null) {
                this.isScattered = true;
                this.particles.forEach(particle => {
                    particle.setTarget(
                        particle.x + (Math.random() - 0.5) * this.scatterAmount,
                        particle.y + (Math.random() - 0.5) * this.scatterAmount
                    );
                });

                if (callback) {
                    // 根据是否为秒位使用不同的动画时间
                    const animationTime = this.isSecond ? 150 : 300;
                    setTimeout(() => {
                        this.gather();
                        callback();
                    }, animationTime);
                }
            }

            gather() {
                this.isScattered = false;
                this._updateParticlePositions();
            }

            update() {
                this.particles.forEach(particle => particle.update());
            }

            draw() {
                this.particles.forEach(particle => particle.draw());
            }

            getDigitPoints(digit) {
                // 增加垂直方向的点阵密度
                const digits = {
                    0: [
                        [0,0],[1,0],[2,0],
                        [0,0.5],[2,0.5],
                        [0,1],[2,1],
                        [0,1.5],[2,1.5],
                        [0,2],[2,2],
                        [0,2.5],[2,2.5],
                        [0,3],[2,3],
                        [0,3.5],[2,3.5],
                        [0,4],[1,4],[2,4],
                        [0.5,0],[1.5,0],
                        [0.5,4],[1.5,4]
                    ],
                    1: [
                        [1,0],
                        [1,0.5],
                        [1,1],
                        [1,1.5],
                        [1,2],
                        [1,2.5],
                        [1,3],
                        [1,3.5],
                        [1,4]
                    ],
                    2: [
                        [0,0],[1,0],[2,0],
                        [2,0.5],
                        [2,1],
                        [0,2],[1,2],[2,2],
                        [0,2.5],
                        [0,3],
                        [0,3.5],
                        [0,4],[1,4],[2,4],
                        [0.5,0],[1.5,0],
                        [0.5,2],[1.5,2],
                        [0.5,4],[1.5,4]
                    ],
                    3: [
                        [0,0],[1,0],[2,0],
                        [2,0.5],
                        [2,1],
                        [0,2],[1,2],[2,2],
                        [2,2.5],
                        [2,3],
                        [2,3.5],
                        [0,4],[1,4],[2,4],
                        [0.5,0],[1.5,0],
                        [0.5,2],[1.5,2],
                        [0.5,4],[1.5,4]
                    ],
                    4: [
                        [0,0],[2,0],
                        [0,0.5],[2,0.5],
                        [0,1],[2,1],
                        [0,1.5],[2,1.5],
                        [0,2],[1,2],[2,2],
                        [2,2.5],
                        [2,3],
                        [2,3.5],
                        [2,4],
                        [0.5,2],[1.5,2]
                    ],
                    5: [
                        [0,0],[1,0],[2,0],
                        [0,0.5],
                        [0,1],
                        [0,2],[1,2],[2,2],
                        [2,2.5],
                        [2,3],
                        [2,3.5],
                        [0,4],[1,4],[2,4],
                        [0.5,0],[1.5,0],
                        [0.5,2],[1.5,2],
                        [0.5,4],[1.5,4]
                    ],
                    6: [
                        [0,0],[1,0],[2,0],
                        [0,0.5],
                        [0,1],
                        [0,1.5],
                        [0,2],[1,2],[2,2],
                        [0,2.5],[2,2.5],
                        [0,3],[2,3],
                        [0,3.5],[2,3.5],
                        [0,4],[1,4],[2,4],
                        [0.5,0],[1.5,0],
                        [0.5,2],[1.5,2],
                        [0.5,4],[1.5,4]
                    ],
                    7: [
                        [0,0],[1,0],[2,0],
                        [2,0.5],
                        [2,1],
                        [1,1.5],
                        [1,2],
                        [1,2.5],
                        [1,3],
                        [1,3.5],
                        [1,4],
                        [0.5,0],[1.5,0]
                    ],
                    8: [
                        [0,0],[1,0],[2,0],
                        [0,0.5],[2,0.5],
                        [0,1],[2,1],
                        [0,1.5],[2,1.5],
                        [0,2],[1,2],[2,2],
                        [0,2.5],[2,2.5],
                        [0,3],[2,3],
                        [0,3.5],[2,3.5],
                        [0,4],[1,4],[2,4],
                        [0.5,0],[1.5,0],
                        [0.5,2],[1.5,2],
                        [0.5,4],[1.5,4]
                    ],
                    9: [
                        [0,0],[1,0],[2,0],
                        [0,0.5],[2,0.5],
                        [0,1],[2,1],
                        [0,1.5],[2,1.5],
                        [0,2],[1,2],[2,2],
                        [2,2.5],
                        [2,3],
                        [2,3.5],
                        [0,4],[1,4],[2,4],
                        [0.5,0],[1.5,0],
                        [0.5,2],[1.5,2],
                        [0.5,4],[1.5,4]
                    ]
                };
                return digits[digit] || [];
            }
        }

        const digits = [];
        const digitSize = 28;    // 增大数字大小
        const spacing = 100;      // 显著增加基础间距
        let lastTime = '';

        function initializeDigits() {
            digits.length = 0;
            const totalWidth = spacing * 6;  // 移除额外间距
            const startX = canvas.width / 2 - totalWidth / 2;
            const startY = canvas.height / 2 - digitSize * 2;

            for (let i = 0; i < 6; i++) {
                let x = startX + i * spacing;
                // 调整时分秒之间的间距
                if (i >= 2) x += spacing * 0.35;  // 时分之间的间距
                if (i >= 4) x += spacing * 0.35;  // 分秒之间的间距
                
                const digit = new Digit(x, startY, digitSize);
                // 标记秒位数字
                if (i >= 4) {
                    digit.isSecond = true;
                }
                digits.push(digit);
                digit.setDigit(0, true);
            }
        }

        // 添加计时器相关变量
        let isTimerMode = false;
        let timerInterval;
        let startTime;
        let elapsedTime = 0;
        let isTimerRunning = false;

        // 添加UI元素
        const toggleButton = document.getElementById('toggleButton');
        let hideTimeout;

        // 事件监听器
        document.addEventListener('click', (e) => {
            if (e.target === toggleButton) {
                return;
            }
            
            if (isTimerMode && isTimerRunning) {
                stopTimer();
            }
            showUI();
        });

        document.addEventListener('dblclick', (e) => {
            if (isTimerMode && e.target !== toggleButton && !isTimerRunning) {
                startTimer();
                showUI();
            }
        });

        // 修改切换按钮的点击事件处理
        toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!isTimerMode) {
                isTimerMode = true;
                toggleButton.innerHTML = `
                    <svg viewBox="0 0 24 24">
                        <path d="M6 2v6h0.01L6 8.01 10 12l-4 4 0.01 0.01H6V22h12v-5.99h-0.01L18 16l-4-4 4-3.99-0.01-0.01H18V2H6z M16 16.5V20H8v-3.5l4-4 4 4z"/>
                    </svg>
                `;
                debug.textContent = isTimerRunning ? 'Timing...' : 'Timer mode';
                debug.classList.add('visible');
                // 如果计时器正在运行，不重置
                if (!isTimerRunning) {
                    resetTimer();
                }
            } else {
                isTimerMode = false;
                toggleButton.innerHTML = `
                    <svg viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                `;
                debug.textContent = '';
                debug.classList.remove('visible');
            }
        });

        // 计时器相关函数
        function startTimer() {
            if (!isTimerRunning) {
                startTime = Date.now() - elapsedTime;
                isTimerRunning = true;
                debug.textContent = 'Timing...';
                debug.classList.add('visible');
            }
        }

        function stopTimer() {
            if (isTimerRunning) {
                isTimerRunning = false;
                elapsedTime = Date.now() - startTime;
                debug.textContent = 'Timer paused';
            }
        }

        function resetTimer() {
            stopTimer();
            elapsedTime = 0;
            lastTime = '';  // 重置lastTime以强制更新显示
            debug.textContent = 'Timer reset';
        }

        // 修改showUI函数
        function showUI() {
            toggleButton.classList.add('visible');
            if (isTimerMode) {
                debug.classList.add('visible');
                debug.textContent = isTimerRunning ? 'Timing...' : 'Timer paused';
            }
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(hideUI, 3000);
        }

        function hideUI() {
            if (!isTimerMode && !isTimerRunning) {
                toggleButton.classList.remove('visible');
                debug.classList.remove('visible');
            }
        }

        function animate() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (isTimerMode) {
                const timeDiff = isTimerRunning ? Date.now() - startTime : elapsedTime;
                const hours = Math.floor(timeDiff / 3600000);
                const minutes = Math.floor((timeDiff % 3600000) / 60000);
                const seconds = Math.floor((timeDiff % 60000) / 1000);
                const time = `${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;

                if (time !== lastTime) {
                    time.split('').forEach((digit, index) => {
                        if (index < 6) {
                            digits[index].setDigit(parseInt(digit));
                        }
                    });
                    lastTime = time;
                }

                digits.forEach(digit => {
                    digit.update();
                    digit.draw();
                });

                debug.textContent = isTimerRunning ? 'Timing...' : 'Timer paused';
            } else {
                const now = new Date();
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const seconds = now.getSeconds().toString().padStart(2, '0');
                const time = hours + minutes + seconds;

                if (time !== lastTime) {
                    time.split('').forEach((digit, index) => {
                        if (index < 6) {
                            digits[index].setDigit(parseInt(digit));
                        }
                    });
                    lastTime = time;
                }

                digits.forEach(digit => {
                    digit.update();
                    digit.draw();
                });

                debug.textContent = `Time: ${hours}:${minutes}:${seconds}`;
            }

            requestAnimationFrame(animate);
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        animate();