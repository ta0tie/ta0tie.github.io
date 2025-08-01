/**
 * 极光背景性能优化器
 * 根据设备性能自动选择合适的动画模式
 */

(function() {
  'use strict';

  // 性能检测配置
  const PERFORMANCE_CONFIG = {
    // 高性能设备阈值
    HIGH_PERFORMANCE: {
      minCores: 4,
      minMemory: 4, // GB
      minScreenWidth: 1024,
      minScreenHeight: 768,
      supportedFeatures: ['webgl', 'webgl2']
    },
    // 中等性能设备阈值
    MEDIUM_PERFORMANCE: {
      minCores: 2,
      minMemory: 2, // GB
      minScreenWidth: 768,
      minScreenHeight: 600
    }
  };

  /**
   * 检测设备硬件信息
   */
  function detectHardware() {
    const hardware = {
      cores: navigator.hardwareConcurrency || 2,
      memory: navigator.deviceMemory || 2,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      pixelRatio: window.devicePixelRatio || 1
    };

    return hardware;
  }

  /**
   * 检测浏览器性能特性
   */
  function detectBrowserFeatures() {
    const features = {
      webgl: !!window.WebGLRenderingContext,
      webgl2: !!window.WebGL2RenderingContext,
      requestAnimationFrame: !!window.requestAnimationFrame,
      cssTransforms3d: testCSS3DTransforms(),
      willChange: testWillChange()
    };

    return features;
  }

  /**
   * 测试CSS 3D变换支持
   */
  function testCSS3DTransforms() {
    const el = document.createElement('div');
    el.style.transform = 'translate3d(0,0,0)';
    return el.style.transform !== '';
  }

  /**
   * 测试will-change支持
   */
  function testWillChange() {
    const el = document.createElement('div');
    el.style.willChange = 'transform';
    return el.style.willChange === 'transform';
  }

  /**
   * 检测用户偏好设置
   */
  function detectUserPreferences() {
    const preferences = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      lowPowerMode: navigator.getBattery ? false : null, // 将在后续异步检测
      userChoice: localStorage.getItem('aurora-performance-mode')
    };

    return preferences;
  }

  /**
   * 执行性能基准测试
   */
  function performanceBenchmark() {
    return new Promise((resolve) => {
      const startTime = performance.now();
      let iterations = 0;
      const maxTime = 16; // 一帧的时间

      function testLoop() {
        const currentTime = performance.now();
        if (currentTime - startTime < maxTime) {
          // 执行一些计算密集型操作
          Math.random() * Math.random();
          iterations++;
          requestAnimationFrame(testLoop);
        } else {
          resolve(iterations);
        }
      }

      requestAnimationFrame(testLoop);
    });
  }

  /**
   * 计算性能评分
   */
  async function calculatePerformanceScore() {
    const hardware = detectHardware();
    const features = detectBrowserFeatures();
    const preferences = detectUserPreferences();
    const benchmark = await performanceBenchmark();

    let score = 0;

    // 硬件评分 (40%)
    score += Math.min(hardware.cores / 8, 1) * 15;
    score += Math.min(hardware.memory / 8, 1) * 15;
    score += Math.min((hardware.screenWidth * hardware.screenHeight) / (1920 * 1080), 1) * 10;

    // 浏览器特性评分 (30%)
    score += features.webgl ? 10 : 0;
    score += features.webgl2 ? 5 : 0;
    score += features.cssTransforms3d ? 10 : 0;
    score += features.willChange ? 5 : 0;

    // 性能基准测试评分 (30%)
    score += Math.min(benchmark / 1000, 1) * 30;

    // 用户偏好调整
    if (preferences.reducedMotion) {
      score = 0; // 用户明确要求减少动画
    }

    if (preferences.userChoice) {
      switch (preferences.userChoice) {
        case 'high':
          score = 100;
          break;
        case 'medium':
          score = 60;
          break;
        case 'low':
        case 'static':
          score = 20;
          break;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 根据评分确定性能级别（简化为动态/静态两种模式）
   */
  function determinePerformanceLevel(score) {
    if (score >= 60) {
      return 'performance-high'; // 动态模式
    } else {
      return 'performance-low';  // 静态模式
    }
  }

  /**
   * 应用性能级别
   */
  function applyPerformanceLevel(level) {
    const body = document.body;
    
    // 移除所有性能类名
    body.classList.remove('performance-high', 'performance-low', 'reduce-motion');
    
    // 添加新的性能级别类名
    body.classList.add(level);
    
    // 设置背景模式属性
    if (level === 'performance-high') {
      body.setAttribute('data-background-mode', 'dynamic');
    } else {
      body.setAttribute('data-background-mode', 'static');
    }
    
    // 如果用户偏好减少动画，额外添加reduce-motion类
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      body.classList.add('reduce-motion');
    }

    // 保存到localStorage以便下次快速加载
    localStorage.setItem('aurora-performance-level', level);
    
    console.log(`极光背景性能级别: ${level}`);
  }

  /**
   * 创建性能控制面板
   */
  function createPerformanceControl() {
    // 检查是否已存在控制面板
    if (document.getElementById('aurora-performance-control')) {
      return;
    }

    const control = document.createElement('div');
    control.id = 'aurora-performance-control';
    control.innerHTML = `
      <style>
        #aurora-performance-control {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 10px;
          border-radius: 8px;
          font-size: 12px;
          z-index: 10000;
          display: none;
        }
        #aurora-performance-control.show {
          display: block;
        }
        #aurora-performance-control select {
          margin-left: 5px;
          padding: 2px;
        }
      </style>
      <div>
        极光性能:
        <select id="aurora-performance-select">
          <option value="auto">自动检测</option>
          <option value="dynamic">动态模式</option>
          <option value="static">静态模式</option>
        </select>
      </div>
    `;

    document.body.appendChild(control);

    // 绑定选择事件
    const select = control.querySelector('#aurora-performance-select');
    select.addEventListener('change', function() {
      const value = this.value;
      if (value === 'auto') {
        localStorage.removeItem('aurora-performance-mode');
        initPerformanceOptimizer();
      } else {
        localStorage.setItem('aurora-performance-mode', value);
        let level;
        switch (value) {
          case 'dynamic':
            level = 'performance-high';
            break;
          case 'static':
            level = 'performance-low';
            break;
        }
        applyPerformanceLevel(level);
      }
    });

    // 设置当前值
    const currentMode = localStorage.getItem('aurora-performance-mode') || 'auto';
    select.value = currentMode;

    // 双击显示/隐藏控制面板
    let clickCount = 0;
    document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        control.classList.toggle('show');
      }
    });
  }

  /**
   * 初始化性能优化器
   */
  async function initPerformanceOptimizer() {
    try {
      // 首先检查是否有缓存的性能级别
      const cachedLevel = localStorage.getItem('aurora-performance-level');
      const userChoice = localStorage.getItem('aurora-performance-mode');
      
      if (userChoice && userChoice !== 'auto') {
        // 用户有明确选择，直接应用
        let level;
        switch (userChoice) {
          case 'dynamic':
            level = 'performance-high';
            break;
          case 'static':
            level = 'performance-low';
            break;
        }
        applyPerformanceLevel(level);
        return;
      }

      if (cachedLevel) {
        // 先应用缓存的级别，避免闪烁
        applyPerformanceLevel(cachedLevel);
      }

      // 执行完整的性能检测
      const score = await calculatePerformanceScore();
      const level = determinePerformanceLevel(score);
      
      // 如果检测结果与缓存不同，更新
      if (level !== cachedLevel) {
        applyPerformanceLevel(level);
      }

    } catch (error) {
      console.warn('性能检测失败，使用低性能模式:', error);
      applyPerformanceLevel('performance-low');
    }
  }

  /**
   * 监听性能变化
   */
  function setupPerformanceMonitoring() {
    // 监听窗口大小变化
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initPerformanceOptimizer, 1000);
    });

    // 监听用户偏好变化
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addListener(function() {
      initPerformanceOptimizer();
    });

    // 监听电池状态变化（如果支持）
    if (navigator.getBattery) {
      navigator.getBattery().then(function(battery) {
        battery.addEventListener('chargingchange', function() {
          if (!battery.charging && battery.level < 0.2) {
            // 电量低且未充电时，强制使用低性能模式
            applyPerformanceLevel('performance-low');
          }
        });
      });
    }
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initPerformanceOptimizer();
      createPerformanceControl();
      setupPerformanceMonitoring();
      initBackgroundToggle();
    });
  } else {
    initPerformanceOptimizer();
    createPerformanceControl();
    setupPerformanceMonitoring();
    initBackgroundToggle();
  }

  /**
   * 切换背景模式
   */
  function toggleBackgroundMode() {
    const currentMode = localStorage.getItem('aurora-performance-mode') || 'auto';
    let newMode;
    
    switch (currentMode) {
      case 'auto':
      case 'static':
        newMode = 'dynamic';
        break;
      case 'dynamic':
        newMode = 'static';
        break;
    }
    
    localStorage.setItem('aurora-performance-mode', newMode);
    
    let level;
    switch (newMode) {
      case 'dynamic':
        level = 'performance-high';
        break;
      case 'static':
        level = 'performance-low';
        break;
    }
    
    applyPerformanceLevel(level);
    
    // 显示切换提示
    const modeText = newMode === 'dynamic' ? '动态模式' : '静态模式';
    if (window.anzhiyu && window.anzhiyu.snackbarShow) {
      window.anzhiyu.snackbarShow(`背景已切换至${modeText}`);
    } else {
      console.log(`背景已切换至${modeText}`);
    }
  }
  
  /**
   * 初始化背景切换按钮
   */
  function initBackgroundToggle() {
    // 等待DOM加载完成
    const initButton = () => {
      const button = document.getElementById('switch-background');
      if (button) {
        button.addEventListener('click', toggleBackgroundMode);
        
        // 根据当前模式更新按钮状态
        const updateButtonState = () => {
          const currentMode = localStorage.getItem('aurora-performance-mode') || 'auto';
          const body = document.body;
          
          if (body.classList.contains('performance-high') || currentMode === 'dynamic') {
            button.title = '切换到静态模式';
          } else {
            button.title = '切换到动态模式';
          }
        };
        
        updateButtonState();
        
        // 监听性能级别变化
        const observer = new MutationObserver(updateButtonState);
        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ['class']
        });
      } else {
        // 如果按钮还没有加载，延迟重试
        setTimeout(initButton, 100);
      }
    };
    
    initButton();
  }

  // 导出到全局作用域以便调试
  window.AuroraPerformanceOptimizer = {
    init: initPerformanceOptimizer,
    calculateScore: calculatePerformanceScore,
    applyLevel: applyPerformanceLevel,
    toggleBackground: toggleBackgroundMode,
    initBackgroundToggle: initBackgroundToggle
  };

})();