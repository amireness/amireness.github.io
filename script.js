const cursor = document.getElementById("cursor");
const cursorRing = document.getElementById("cursorRing");


let mouseX = 0;
let mouseY = 0;

let ringX = 0;
let ringY = 0;


document.addEventListener("mousemove", (event) => {

  mouseX = event.clientX;
  mouseY = event.clientY;

  cursor.style.transform =
    `translate(${mouseX - 5}px, ${mouseY - 5}px)`;

});


function animateCursorRing() {

  ringX += (mouseX - ringX - 16) * 0.12;
  ringY += (mouseY - ringY - 16) * 0.12;

  cursorRing.style.transform =
    `translate(${ringX}px, ${ringY}px)`;

  requestAnimationFrame(animateCursorRing);

}


animateCursorRing();



const revealElements =
  document.querySelectorAll(".reveal");


const observer =
  new IntersectionObserver(

    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          observer.unobserve(entry.target);

        }

      });

    },

    {
      threshold: 0.1
    }

  );


revealElements.forEach(element => {

  observer.observe(element);

});



const sections =
  document.querySelectorAll("section[id]");


const navLinks =
  document.querySelectorAll(".nav-links a");


window.addEventListener("scroll", () => {

  let currentSection = "";


  sections.forEach(section => {

    const sectionTop =
      section.offsetTop - 150;


    if (window.scrollY >= sectionTop) {

      currentSection =
        section.getAttribute("id");

    }

  });


  navLinks.forEach(link => {

    link.classList.remove("active");


    if (
      link.getAttribute("href") ===
      `#${currentSection}`
    ) {

      link.classList.add("active");

    }

  });

});