import categoriesTranslation from "./categoriesTranslation.js";

let allCourses = [];

document.addEventListener("DOMContentLoaded", function () {
    function renderCourses(courses) {
        const container = document.querySelector(".course-container");
        container.innerHTML = "";

        if (courses.length === 0) {
            container.innerHTML = "<p>Không có khóa học nào phù hợp.</p>";
            return;
        }

        courses.forEach(course => {
            const courseHTML = `
                <div class="course-box" data-course-name="${course.name}">
                    <img src="${course.image_url}" alt="">
                    <div class="course-inf">
                        <div class="price">
                            <h5>Miễn phí</h5>
                        </div>
                    </div>
                    <div class="course-layer">
                        <h4>${course.name}</h4>
                        <p>${course.intro}</p>
                        <div class="course-end">
                            <img src="${course.teacher_avatar}" alt="">
                            <p>${course.teacher_name}</p>
                            <h5><i class='bx bxs-group'></i> ${course.number_of_students}</h5>
                            <h5><i class='bx bxs-file' ></i> ${course.number_of_lessons}</h5>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += courseHTML;
        });

        // Thêm sự kiện click vào mỗi course-box sau khi render
        const courseBoxes = document.querySelectorAll(".course-box");
        courseBoxes.forEach(courseBox => {
            courseBox.addEventListener("click", function () {
                const courseName = courseBox.getAttribute("data-course-name").replace(/\s+/g, '-');
                window.location.href = `/course/${courseName}`;
            });
        });
    }

    function renderCategories(categories) {
        const branchContainer = document.querySelector(".branch-list-item");
        branchContainer.innerHTML = "";

        const allBtn = document.createElement("a");
        allBtn.href = "#";
        allBtn.classList.add("active");
        allBtn.textContent = "Tất cả";
        allBtn.addEventListener("click", () => {
            document.querySelectorAll(".branch-list-item a").forEach(a => a.classList.remove("active"));
            allBtn.classList.add("active");
            renderCourses(allCourses);
        });
        branchContainer.appendChild(allBtn);

        categories.forEach(cat => {
            const catBtn = document.createElement("a");
            catBtn.href = "#";
            catBtn.textContent = categoriesTranslation[cat.name];
            catBtn.addEventListener("click", () => {
                document.querySelectorAll(".branch-list-item a").forEach(a => a.classList.remove("active"));
                catBtn.classList.add("active");
                const filtered = allCourses.filter(course => course.category_id === cat.id);
                renderCourses(filtered);
            });
            branchContainer.appendChild(catBtn);
        });
    }

    // Fetch data from API
    fetch("/api/course")
        .then(res => res.json())
        .then(data => {
            allCourses = data.courses;
            renderCourses(allCourses);
            renderCategories(data.categories);
        })
        .catch(err => console.error("Lỗi khi tải dữ liệu:", err));

    // Xử lý tìm kiếm
    document.getElementById("searchInput").addEventListener("input", function () {
        const keyword = this.value.toLowerCase();
        const filtered = allCourses.filter(course =>
            course.name.toLowerCase().includes(keyword) ||
            course.intro.toLowerCase().includes(keyword) ||
            course.description.toLowerCase().includes(keyword)
        );
        renderCourses(filtered);
    });
});
