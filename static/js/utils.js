const shortenText = (text, maxLength = 20, appendix = "...") => {
    return text.length > maxLength? text.slice(0, maxLength)+appendix: text;
};

const getCoursesForSelection = async () => {
    try {
        const response = await fetch("/api/admin/courses", {
            method: "GET"
        });
        const data = await response.json();
        console.log(data.courses);
        return data.courses;
    } catch (err) {
        console.error("Error getting courses:", err);
        return []; 
    }
};

const getCategoriesForSelection = async () => {
    try {
        const response = await fetch("/api/category", {
            method: "GET"
        });
        const data = await response.json();
        console.log(data.categories);
        return data.categories;
    } catch (err) {
        console.error("Error getting categories:", err);
        return []; 
    }
};

const capitalizeOneWord = (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
};

const sortList = (list, sortCriteria, sortOrder) => {
    if (sortCriteria.length === 0)
        return list;

    return [...list].sort((a, b) => {
        if (a[sortCriteria] > b[sortCriteria]) return sortOrder === "asc" ? 1 : -1;
        if (a[sortCriteria] < b[sortCriteria]) return sortOrder === "asc" ? -1 : 1;
        return 0;
    });
};

const debounce = (func, delay) => {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId); // Hủy lần gọi trước nếu có
    timeoutId = setTimeout(() => {
      func.apply(this, args); // Gọi hàm sau khi delay
    }, delay);
  };
};

export {shortenText, capitalizeOneWord, getCoursesForSelection, getCategoriesForSelection, sortList, debounce};