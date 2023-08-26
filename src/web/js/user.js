if (sessionStorage.getItem("userId") == null){
    sessionStorage.setItem("userId", Date.now().toString());
    console.log("userId set");   
} else {
    console.log("userId exists", sessionStorage.getItem("userId"));   
}

const User = class {
    constructor() { }
    
}