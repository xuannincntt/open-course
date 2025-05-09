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

export {shortenText, getCoursesForSelection, getCategoriesForSelection, capitalizeOneWord};