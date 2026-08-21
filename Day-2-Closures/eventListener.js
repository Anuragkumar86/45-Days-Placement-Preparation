
function setUpButtonTracker(){
    let count = 0;

    const btn = document.getElementById("btn")
    const pp = document.getElementById("show")
    pp.innerText = count

    btn.addEventListener("click", () => {
        count++;
        pp.innerText = count
        console.log(`Button clicked ${count} times`)
    })
}

setUpButtonTracker()