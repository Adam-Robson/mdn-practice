const displayedImage = document.querySelector('.displayed-img');
const thumbBar = document.querySelector('.thumb-bar');
const btn = document.querySelector('button');
const overlay = document.querySelector('.overlay');

const imageFilenames = ['pic1.jpg', 'pic2.jpg', 'pic3.jpg', 'pic4.jpg', 'pic5.jpg'];

const imageAlts = {
  'pic1.jpg': 'Image 1 description',
  'pic2.jpg': 'Image 2 description',
  'pic3.jpg': 'Image 3 description',
  'pic4.jpg': 'Image 4 description',
  'pic5.jpg': 'Image 5 description'
};

imageFilenames.forEach((filename) => {
  const newImage = document.createElement('img');

  newImage.setAttribute('src', `images/${ filename }`);
  newImage.setAttribute('alt', imageAlts[filename]);

  thumbBar.appendChild(newImage);

  newImage.addEventListener('click', () => {
    displayedImage.setAttribute('src', `images/${ filename }`);
    displayedImage.setAttribute('alt', imageAlts[filename]);
  });
});

btn.addEventListener('click', () => {
  const currentClass = btn.getAttribute('class');

  if (currentClass === 'dark') {
    btn.setAttribute('class', 'light');
    btn.textContent = 'Lighten';
    overlay.style.backgroundColor = 'rgb(0 0 0 / 50%)';
  } else {
    btn.setAttribute('class', 'dark');
    btn.textContent = 'Darken';
    overlay.style.backgroundColor = 'rgb(0 0 0 / 0%)';
  }
});
