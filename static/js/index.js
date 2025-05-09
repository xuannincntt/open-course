const categoriesContainer = document.getElementsByClassName("categories")[0];
// get current date
const dateDisplay = document.getElementsByClassName("header-date")[0];



document.addEventListener("DOMContentLoaded", async () => {
    dateDisplay.textContent = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
});

const submenuButton = document.getElementsByClassName("submenu-icon")[0];

submenuButton.addEventListener("click", () => {
    const submenu = document.getElementsByClassName("submenu")[0];
    submenu.classList.toggle("hidden");
    console.log(submenu.classList);
    submenuButton.classList.toggle("bxs-down-arrow");
    submenuButton.classList.toggle("bxs-up-arrow");
});

const sidebarLinks = [...document.getElementsByClassName("sidebar-link")];
sidebarLinks.forEach(link => {
    link.addEventListener("click", () => {
        sidebarLinks.forEach(item => item.classList.remove("sidebar-link-active"));
        link.classList.add("sidebar-link-active");
    })
})




