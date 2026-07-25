// anime.js v4 API: timeline.add(targets, animationParams, position)

// SVG drawing animation - line by line reveal
export const drawPath = (timelineRef, selector, options = {}) => {
  const {
    duration = 1000,
    delay = 0,
    ease = 'inOutQuad',
  } = options;

  const paths = document.querySelectorAll(selector);
  paths.forEach((path) => {
    const length = path.getTotalLength();
    path.setAttribute('stroke-dasharray', length);
    path.setAttribute('stroke-dashoffset', length);
  });

  timelineRef.add(selector, {
    strokeDashoffset: (el) => [el.getAttribute('stroke-dashoffset'), 0],
    duration,
    delay,
    ease,
  }, 0);
};

// Pulse/heartbeat effect for emphasis
export const pulseEffect = (timelineRef, selector, options = {}) => {
  const {
    scale = 1.1,
    duration = 600,
    delay = 0,
  } = options;

  timelineRef.add(selector, {
    scale: [1, scale, 1],
    duration,
    delay,
    ease: 'inOutQuad',
  });
};

// Radial expand/burst from center
export const radialBurst = (timelineRef, selector, options = {}) => {
  const {
    radius = 100,
    duration = 800,
    delay = 0,
    staggerPercent = 30,
  } = options;

  timelineRef.add(selector, {
    r: [0, radius],
    opacity: [1, 0],
    duration,
    delay,
    ease: 'outQuad',
    stagger: {
      direction: 'normal',
      value: staggerPercent,
    },
  });
};

// Text number count-up animation
export const countUpNumber = (timelineRef, element, to, options = {}) => {
  const {
    from = 0,
    duration = 1000,
    delay = 0,
    format = (val) => Math.round(val),
  } = options;

  const state = { value: from };

  timelineRef.add(state, {
    value: to,
    round: 1,
    duration,
    delay,
    ease: 'outQuad',
    onUpdate: () => {
      element.textContent = format(state.value);
    },
  });
};

// Cascading color change (like a wave)
export const colorWave = (timelineRef, selector, toColor, options = {}) => {
  const {
    duration = 800,
    delay = 0,
    staggerValue = 50,
  } = options;

  timelineRef.add(selector, {
    fill: toColor,
    duration,
    delay,
    ease: 'outQuad',
    stagger: staggerValue,
  });
};

// Rotation with scale (gear-like effect)
export const gearRotation = (timelineRef, selector, options = {}) => {
  const {
    duration = 2000,
    delay = 0,
    rotations = 2,
    scaleOscillate = false,
  } = options;

  const animParams = {
    rotate: 360 * rotations,
    duration,
    delay,
    ease: 'linear',
  };

  if (scaleOscillate) {
    animParams.scale = [1, 1.05, 1];
  }

  timelineRef.add(selector, animParams);
};

// Smooth transition between two viewBox values (zoom effect)
export const svgZoom = (timelineRef, svgElement, fromViewBox, toViewBox, options = {}) => {
  const {
    duration = 1500,
    delay = 0,
    ease = 'inOutQuad',
  } = options;

  const fromParts = fromViewBox.split(' ').map(Number);
  const toParts = toViewBox.split(' ').map(Number);
  const state = { progress: 0 };

  timelineRef.add(state, {
    progress: 1,
    duration,
    delay,
    ease,
    onUpdate: () => {
      const vb = fromParts
        .map((from, i) => from + (toParts[i] - from) * state.progress)
        .join(' ');
      svgElement.setAttribute('viewBox', vb);
    },
  });
};

// Morphing between shapes (requires two paths)
export const morphShape = (timelineRef, fromPath, toPath, options = {}) => {
  const {
    duration = 1000,
    delay = 0,
    ease = 'inOutQuad',
  } = options;

  timelineRef.add(fromPath, {
    d: [fromPath.getAttribute('d'), toPath.getAttribute('d')],
    duration,
    delay,
    ease,
  });
};

// Staggered appear with rotation (like cards flipping in)
export const flipInStagger = (timelineRef, selector, options = {}) => {
  const {
    duration = 600,
    delay = 0,
    staggerValue = 100,
    rotationAxis = 'Y',
  } = options;

  const rotate = rotationAxis === 'Y'
    ? { rotateY: [-90, 0] }
    : rotationAxis === 'X'
    ? { rotateX: [-90, 0] }
    : { rotate: [45, 0] };

  timelineRef.add(selector, {
    ...rotate,
    opacity: [0, 1],
    duration,
    delay,
    ease: 'outElastic(1, .6)',
    stagger: staggerValue,
  });
};

// Floating/bobbing animation
export const floating = (timelineRef, selector, options = {}) => {
  const {
    distance = 20,
    duration = 3000,
    delay = 0,
  } = options;

  timelineRef.add(selector, {
    translateY: [-distance, distance, -distance],
    duration,
    delay,
    ease: 'inOutSine',
    loop: true,
  });
};

// Path follower animation (element follows an SVG path)
export const followPath = (timelineRef, element, pathElement, options = {}) => {
  const {
    duration = 2000,
    delay = 0,
    ease = 'inOutQuad',
  } = options;

  const pathLength = pathElement.getTotalLength();
  const progress = { value: 0 };

  timelineRef.add(progress, {
    value: 1,
    duration,
    delay,
    ease,
    onUpdate: () => {
      const point = pathElement.getPointAtLength(pathLength * progress.value);
      element.style.transform = `translate(${point.x}px, ${point.y}px)`;
    },
  });
};

// Grid/matrix animation - elements light up in a pattern
export const gridPattern = (timelineRef, selector, options = {}) => {
  const {
    columns = 4,
    duration = 300,
    delay = 0,
    pattern = 'spiral', // 'spiral', 'wave', 'diagonal', 'random'
  } = options;

  const elements = Array.from(document.querySelectorAll(selector));
  const indices = getPatternIndices(elements.length, columns, pattern);

  indices.forEach((idx, order) => {
    timelineRef.add(elements[idx], {
      opacity: [0, 1],
      scale: [0.5, 1],
      duration,
      delay: order * 30,
      ease: 'outQuad',
    }, delay);
  });
};

// Helper to generate pattern indices
function getPatternIndices(total, cols, pattern) {
  const indices = Array.from({ length: total }, (_, i) => i);

  if (pattern === 'spiral') {
    return spiralOrder(indices, cols);
  } else if (pattern === 'wave') {
    return waveOrder(indices, cols);
  } else if (pattern === 'diagonal') {
    return diagonalOrder(indices, cols);
  } else if (pattern === 'random') {
    return indices.sort(() => Math.random() - 0.5);
  }
  return indices;
}

function spiralOrder(indices, cols) {
  const rows = Math.ceil(indices.length / cols);
  const result = [];
  let top = 0, bottom = rows - 1, left = 0, right = cols - 1;

  while (top <= bottom && left <= right) {
    for (let i = left; i <= right; i++) result.push(top * cols + i);
    top++;
    for (let i = top; i <= bottom; i++) result.push(i * cols + right);
    right--;
    if (top <= bottom) for (let i = right; i >= left; i--) result.push(bottom * cols + i);
    bottom--;
    if (left <= right) for (let i = bottom; i >= top; i--) result.push(i * cols + left);
    left++;
  }
  return result.filter(i => i < indices.length);
}

function waveOrder(indices, cols) {
  return indices.sort((a, b) => {
    const aCol = a % cols;
    const bCol = b % cols;
    return Math.abs(aCol - cols / 2) - Math.abs(bCol - cols / 2);
  });
}

function diagonalOrder(indices, cols) {
  const rows = Math.ceil(indices.length / cols);
  const diags = [];
  for (let diag = 0; diag < rows + cols - 1; diag++) {
    for (let row = 0; row < rows; row++) {
      const col = diag - row;
      if (col >= 0 && col < cols) diags.push(row * cols + col);
    }
  }
  return diags.filter(i => i < indices.length);
}
