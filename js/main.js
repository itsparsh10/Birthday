// Main JavaScript for Birthday Invitation Website

// Detect mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                 (window.innerWidth <= 768) ||
                 ('ontouchstart' in window);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (!isMobile || window.innerWidth > 640) {
    initBalloons();
  }
  init3DCard();
  initScrollAnimations();
});

// ==================== 3D Card Animation ====================
function init3DCard() {
  const card = document.getElementById('invitation-card');
  const cardShadow = document.getElementById('card-shadow');
  const cardShine = document.getElementById('card-shine');
  const cardImage = card?.querySelector('img');
  const cardSection = document.getElementById('invitation-section');
  
  if (!card || !cardSection) return;
  
  let isHovering = false;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  
  // Scroll-based opening animation
  let scrollProgress = 0;
  let scrollRotationX = 0;
  let scrollRotationY = 0;
  let scrollScale = 0.8;
  let scrollOpacity = 0;
  
  // Easing function for smooth animation
  function easeInOutCubic(t) {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  // Calculate scroll progress and card opening animation
  function updateScrollAnimation() {
    const rect = cardSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const sectionHeight = rect.height;
    
    // Calculate scroll progress (0 to 1)
    // Card starts opening when it enters viewport
    const startPoint = windowHeight * 0.5; // Start when card is 50% from top
    const endPoint = -sectionHeight * 0.3; // End when card is 30% past viewport
    
    const scrollPosition = rect.top;
    scrollProgress = Math.max(0, Math.min(1, 
      (startPoint - scrollPosition) / (startPoint - endPoint)
    ));
    
    // Postcard opening effect - card opens as you scroll
    // Start with card closed (rotated), open to flat
    // Use easing function for smoother animation
    const easedProgress = easeInOutCubic(scrollProgress);
    
    // Reduce rotation angles on mobile for better performance and UX
    const maxRotationX = isMobile ? -30 : -45;
    const maxRotationY = isMobile ? 15 : 20;
    const minScale = isMobile ? 0.7 : 0.6;
    
    scrollRotationX = maxRotationX * (1 - easedProgress); // Start rotated, end at 0deg
    scrollRotationY = maxRotationY * (1 - easedProgress); // Start rotated, end at 0deg
    scrollScale = minScale + (easedProgress * (1 - minScale)); // Start smaller, grow to normal
    scrollOpacity = easedProgress; // Fade in as it opens
  }
  
  // Smooth animation using requestAnimationFrame
  function animate() {
    // Update scroll animation
    updateScrollAnimation();
    
    // Smooth interpolation for mouse hover
    currentX += (targetX - currentX) * 0.1;
    currentY += (targetY - currentY) * 0.1;
    
    // Combine scroll and hover effects
    let finalRotateX = scrollRotationX;
    let finalRotateY = scrollRotationY;
    let finalScale = scrollScale;
    
    if (isHovering) {
      // Add hover/touch tilt on top of scroll animation
      // Reduce tilt sensitivity on mobile
      const tiltMultiplier = isMobile ? 0.5 : 1;
      finalRotateX += -currentY * CONFIG.card.maxTilt * tiltMultiplier;
      finalRotateY += currentX * CONFIG.card.maxTilt * tiltMultiplier;
      finalScale = scrollScale * (isMobile ? 1.02 : CONFIG.card.scale);
    }
    
    // Apply combined 3D transform with parallax
    // Reduce parallax on mobile for better performance
    const parallaxAmount = isMobile ? 20 : 40;
    const translateZAmount = isMobile ? 30 : 50;
    const parallaxY = (scrollProgress - 0.5) * parallaxAmount;
    
    // Use simpler transform on mobile for better performance
    if (isMobile) {
      card.style.transform = `
        rotateX(${finalRotateX}deg)
        rotateY(${finalRotateY}deg)
        scale(${finalScale})
        translateY(${parallaxY}px)
      `;
    } else {
      card.style.transform = `
        perspective(${CONFIG.card.perspective}px)
        rotateX(${finalRotateX}deg)
        rotateY(${finalRotateY}deg)
        scale(${finalScale})
        translateY(${parallaxY}px)
        translateZ(${scrollProgress * translateZAmount}px)
      `;
    }
    
    // Update opacity based on scroll
    card.style.opacity = Math.max(0.3, scrollOpacity);
    
    // Update shadow position and intensity
    // Reduce shadow complexity on mobile for performance
    const shadowMultiplier = isMobile ? 10 : 20;
    const shadowX = currentX * shadowMultiplier;
    const shadowY = currentY * shadowMultiplier + (scrollProgress - 0.5) * (isMobile ? 15 : 30);
    const baseBlur = isMobile ? 20 : 30;
    const maxBlur = isMobile ? 30 : 40;
    const shadowBlur = baseBlur + scrollProgress * maxBlur + (isHovering ? Math.abs(currentX + currentY) * (isMobile ? 5 : 10) : 0);
    const shadowOpacity = (CONFIG.card.shadowIntensity * 0.3) + (scrollProgress * CONFIG.card.shadowIntensity * 0.7) + (isHovering ? Math.abs(currentX + currentY) * (isMobile ? 0.05 : 0.1) : 0);
    
    cardShadow.style.transform = `translate(${shadowX}px, ${shadowY}px)`;
    cardShadow.style.opacity = shadowOpacity;
    cardShadow.style.filter = `blur(${shadowBlur}px)`;
    
    // Update shine effect position
    const shineX = 50 + currentX * 30;
    const shineY = 50 + currentY * 30;
    const shineOpacity = scrollProgress * 0.4;
    cardShine.style.background = `
      radial-gradient(
        circle at ${shineX}% ${shineY}%,
        rgba(255, 255, 255, ${shineOpacity}) 0%,
        rgba(255, 255, 255, ${shineOpacity * 0.25}) 30%,
        transparent 70%
      )
    `;
    
    // Subtle image parallax
    if (cardImage) {
      const imageX = currentX * 5;
      const imageY = currentY * 5;
      cardImage.style.transform = `translate(${imageX}px, ${imageY}px)`;
      cardImage.style.opacity = scrollOpacity;
    }
    
    requestAnimationFrame(animate);
  }
  
  // Start animation loop
  animate();
  
  // Scroll event listener for smooth updates
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScrollAnimation();
        ticking = false;
      });
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Initial check
  
  // Mouse move handler
  cardSection.addEventListener('mousemove', (e) => {
    if (!isHovering) return;
    
    const rect = cardSection.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate mouse position relative to center (-1 to 1)
    targetX = (e.clientX - centerX) / (rect.width / 2);
    targetY = (e.clientY - centerY) / (rect.height / 2);
    
    // Clamp values
    targetX = Math.max(-1, Math.min(1, targetX));
    targetY = Math.max(-1, Math.min(1, targetY));
  });
  
  // Mouse enter handler
  cardSection.addEventListener('mouseenter', () => {
    isHovering = true;
    card.style.transition = 'none';
  });
  
  // Mouse leave handler
  cardSection.addEventListener('mouseleave', () => {
    isHovering = false;
    targetX = 0;
    targetY = 0;
  });
  
  // Enhanced touch support for mobile devices
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouching = false;
  
  // Prevent default touch behaviors that interfere
  cardSection.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isHovering = true;
      isTouching = true;
      // Prevent scrolling while interacting with card
      e.preventDefault();
    }
  }, { passive: false });
  
  cardSection.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0 && isHovering && isTouching) {
      const rect = cardSection.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      
      // Calculate relative position with reduced sensitivity for mobile
      const sensitivity = 0.7; // Reduce sensitivity on touch
      targetX = ((touchX - centerX) / (rect.width / 2)) * sensitivity;
      targetY = ((touchY - centerY) / (rect.height / 2)) * sensitivity;
      
      targetX = Math.max(-1, Math.min(1, targetX));
      targetY = Math.max(-1, Math.min(1, targetY));
      
      // Prevent scrolling while interacting
      e.preventDefault();
    }
  }, { passive: false });
  
  cardSection.addEventListener('touchend', (e) => {
    isHovering = false;
    isTouching = false;
    targetX = 0;
    targetY = 0;
  });
  
  cardSection.addEventListener('touchcancel', () => {
    isHovering = false;
    isTouching = false;
    targetX = 0;
    targetY = 0;
  });
}

// ==================== Floating Balloons ====================
function initBalloons() {
  const container = document.getElementById('balloons-container');
  if (!container) return;
  
  // Reduce balloon count on mobile for better performance
  const balloonCount = isMobile ? Math.floor(CONFIG.balloons.count / 2) : CONFIG.balloons.count;
  
  for (let i = 0; i < balloonCount; i++) {
    createBalloon(container);
  }
}

function createBalloon(container) {
  const balloon = document.createElement('div');
  const size = Math.random() * (CONFIG.balloons.maxSize - CONFIG.balloons.minSize) + CONFIG.balloons.minSize;
  const color = CONFIG.balloons.colors[Math.floor(Math.random() * CONFIG.balloons.colors.length)];
  const startX = Math.random() * 100;
  const duration = Math.random() * (CONFIG.balloons.speed.max - CONFIG.balloons.speed.min) + CONFIG.balloons.speed.min;
  const delay = Math.random() * 2;
  
  balloon.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    background: ${color};
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    left: ${startX}%;
    bottom: -${size}px;
    opacity: 0.7;
    animation: floatUp ${duration}s ease-in infinite;
    animation-delay: ${delay}s;
    box-shadow: inset -10px -10px 0 rgba(0, 0, 0, 0.1);
  `;
  
  // Add string
  const string = document.createElement('div');
  string.style.cssText = `
    position: absolute;
    width: 2px;
    height: ${size * 0.8}px;
    background: rgba(0, 0, 0, 0.2);
    left: 50%;
    top: 100%;
    transform: translateX(-50%);
  `;
  balloon.appendChild(string);
  
  container.appendChild(balloon);
}

// Add CSS animation for balloons
const style = document.createElement('style');
style.textContent = `
  @keyframes floatUp {
    0% {
      transform: translateY(0) translateX(0);
      opacity: 0.7;
    }
    50% {
      transform: translateY(-50vh) translateX(${Math.random() * 20 - 10}px);
      opacity: 0.8;
    }
    100% {
      transform: translateY(-100vh) translateX(${Math.random() * 40 - 20}px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ==================== Scroll Animations ====================
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
      }
    });
  }, observerOptions);
  
  // Observe all animated elements
  document.querySelectorAll('.fade-in, .scale-in, .slide-left, .slide-right').forEach(el => {
    observer.observe(el);
  });
}

