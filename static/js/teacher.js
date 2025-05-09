async function loadTeachersAndBranches() {
    try {
        const res = await fetch("/api/teacher");
        const data = await res.json();
        const teachers = data.teacher_list;
        const branches = data.branch_list;

        const headerContainer = document.querySelector(".header-teacher");
        const teacherContainer = document.querySelector(".teacher-container");
        const paginationContainer = document.querySelector("#pagination");

        let currentTeachers = teachers;
        let currentPage = 1;
        const teachersPerPage = 8;

        headerContainer.innerHTML = "<h1>Danh sách giảng viên</h1>";

        const navLinks = [];
        const iconMap = {
            "Lập trình": "bx bx-code",
            "Thiết kế": "bx bxs-edit",
            "Marketing": "bx bx-bar-chart-alt-2"
        };

        function setActiveLink(clickedLink) {
            navLinks.forEach(link => link.classList.remove("active"));
            clickedLink.classList.add("active");
        }

        function renderBranches() {
            const allItem = document.createElement("a");
            allItem.href = "#";
            allItem.classList.add("active");
            allItem.textContent = "Tất cả";
            allItem.addEventListener("click", (e) => {
                e.preventDefault();
                currentTeachers = teachers;
                currentPage = 1;
                renderTeachersPaginated();
                setActiveLink(allItem);
            });
            navLinks.push(allItem);
            headerContainer.appendChild(allItem);

            branches.forEach(branch => {
                const item = document.createElement("a");
                item.href = "#";
                const iconClass = iconMap[branch] || "bx bx-book";
                item.innerHTML = `<i class='${iconClass}'></i> ${branch}`;
                item.addEventListener("click", (e) => {
                    e.preventDefault();
                    currentTeachers = teachers.filter(t => t.branch === branch);
                    currentPage = 1;
                    renderTeachersPaginated();
                    setActiveLink(item);
                });
                navLinks.push(item);
                headerContainer.appendChild(item);
            });
        }

        function renderTeachersPaginated() {
            const totalPages = Math.ceil(currentTeachers.length / teachersPerPage);
            const start = (currentPage - 1) * teachersPerPage;
            const end = start + teachersPerPage;
            const currentList = currentTeachers.slice(start, end);
            renderTeachers(currentList);
            renderPagination(paginationContainer, totalPages);
        }

        function renderTeachers(teacherList) {
            teacherContainer.innerHTML = "";

            if (teacherList.length === 0) {
                teacherContainer.innerHTML = "<p>Không có giảng viên nào trong lĩnh vực này.</p>";
                return;
            }

            teacherList.forEach(teacher => {
                const teacherBox = document.createElement("div");
                teacherBox.classList.add("teacher-box");

                const avatar = teacher.avatar || "https://via.placeholder.com/150";

                teacherBox.innerHTML = `
                    <img src="${avatar}" alt="${teacher.name}">
                    <div class="teacher-inf">
                        <h5>${teacher.branch}</h5>
                    </div>
                    <div class="teacher-layer">
                        <h4>${teacher.name}</h4>
                        <p>${teacher.description || "Chưa có mô tả."}</p>
                        <div class="teacher-social">
                            <a href="#"><i class='bx bxl-facebook'></i></a>
                            <a href="#"><i class='bx bxl-gmail'></i></a>
                            <a href="#"><i class='bx bxl-linkedin'></i></a>
                        </div>
                    </div>
                `;
                teacherContainer.appendChild(teacherBox);
            });
        }

        function renderPagination(container, totalPages) {
            container.innerHTML = "";

            if (totalPages <= 1) return;

            const createPageLink = (page) => {
                const a = document.createElement("a");
                a.href = "#";
                a.textContent = page;
                if (page === currentPage) a.classList.add("active");
                a.addEventListener("click", (e) => {
                    e.preventDefault();
                    currentPage = page;
                    renderTeachersPaginated();
                });
                return a;
            };

            const createEllipsis = () => {
                const span = document.createElement("span");
                span.textContent = "...";
                return span;
            };

            container.appendChild(createPageLink(1));

            if (currentPage > 3) {
                container.appendChild(createEllipsis());
            }

            const startPage = Math.max(2, currentPage - 1);
            const endPage = Math.min(totalPages - 1, currentPage + 1);

            for (let i = startPage; i <= endPage; i++) {
                container.appendChild(createPageLink(i));
            }

            if (currentPage < totalPages - 2) {
                container.appendChild(createEllipsis());
            }

            if (totalPages > 1) {
                container.appendChild(createPageLink(totalPages));
            }
        }

        renderBranches();
        renderTeachersPaginated();
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        document.querySelector(".teacher-container").innerHTML = "<p>Lỗi khi tải dữ liệu giảng viên.</p>";
    }
}

document.addEventListener("DOMContentLoaded", loadTeachersAndBranches);
