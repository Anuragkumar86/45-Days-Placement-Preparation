
function outer(){
    let count = 0

    return function inner(){
        count++;
        console.log(`Count is: ${count}`)
    }
}

let counter = outer()
counter();
counter();
counter();
counter();