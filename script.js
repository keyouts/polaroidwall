const board = document.getElementById('board');
const upload = document.getElementById('upload');

let polaroids = JSON.parse(localStorage.getItem('polaroids')) || [];

function saveToLocalStorage() {
  localStorage.setItem('polaroids', JSON.stringify(polaroids));
}

function createPolaroid(images = [], note = '', id = null, top = 0, left = 0) {
  const polaroid = document.createElement('div');
  polaroid.className = 'polaroid';
  polaroid.style.position = 'absolute';
  polaroid.style.top = `${top}px`;
  polaroid.style.left = `${left}px`;

  const inner = document.createElement('div');
  inner.className = 'polaroid-inner';

  const front = document.createElement('div');
  front.className = 'polaroid-front';

  const img = document.createElement('img');
  img.src = images[0];
  front.appendChild(img);

  const nav = document.createElement('div');
  nav.className = 'nav-btns';

  let index = 0;
  if (images.length > 1) {
    const prev = document.createElement('button');
    prev.textContent = '<';
    prev.className = 'brutalist-btn';
    prev.onclick = () => {
      index = (index - 1 + images.length) % images.length;
      img.src = images[index];
    };

    const next = document.createElement('button');
    next.textContent = '>';
    next.className = 'brutalist-btn';
    next.onclick = () => {
      index = (index + 1) % images.length;
      img.src = images[index];
    };

    nav.appendChild(prev);
    nav.appendChild(next);
    front.appendChild(nav);
  }

  const back = document.createElement('div');
  back.className = 'polaroid-back';

  const textarea = document.createElement('textarea');
  textarea.value = note;
  back.appendChild(textarea);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '×';
  deleteBtn.onclick = () => {
    board.removeChild(polaroid);
    polaroids = polaroids.filter(p => p.id !== polaroidData.id);
    saveToLocalStorage();
  };
  polaroid.appendChild(deleteBtn);

  inner.appendChild(front);
  inner.appendChild(back);
  polaroid.appendChild(inner);

  polaroid.ondblclick = () => {
    polaroid.classList.toggle('flipped');
  };

  board.appendChild(polaroid);

  const polaroidData = {
    id: id || Date.now() + Math.random(),
    images,
    note,
    top,
    left
  };

  textarea.oninput = () => {
    polaroidData.note = textarea.value;
    const index = polaroids.findIndex(p => p.id === polaroidData.id);
    if (index !== -1) {
      polaroids[index].note = textarea.value;
      saveToLocalStorage();
    }
  };

  // Drag logic
  let offsetX, offsetY, isDragging = false;

  polaroid.addEventListener('mousedown', e => {
    isDragging = true;
    offsetX = e.clientX - polaroid.offsetLeft;
    offsetY = e.clientY - polaroid.offsetTop;
    polaroid.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    polaroid.style.left = `${e.clientX - offsetX}px`;
    polaroid.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    polaroid.style.cursor = 'grab';
    polaroidData.top = polaroid.offsetTop;
    polaroidData.left = polaroid.offsetLeft;
    const index = polaroids.findIndex(p => p.id === polaroidData.id);
    if (index !== -1) {
      polaroids[index].top = polaroidData.top;
      polaroids[index].left = polaroidData.left;
      saveToLocalStorage();
    }
  });

  if (!id) {
    polaroids.push(polaroidData);
    saveToLocalStorage();
  }
}

function restorePolaroids() {
  polaroids.forEach(p => createPolaroid(p.images, p.note, p.id, p.top, p.left));
}

upload.addEventListener('change', e => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  const images = [];
  let loaded = 0;

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      images.push(reader.result);
      loaded++;
      if (loaded === files.length) {
        createPolaroid(images);
      }
    };
    reader.readAsDataURL(file);
  });
});

restorePolaroids();
