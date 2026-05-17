const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.08,
    rootMargin: "0px 0px -40px 0px"
  }
);

document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
  el.classList.add("reveal-hidden");
  observer.observe(el);
});
